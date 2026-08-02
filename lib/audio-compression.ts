// @ts-nocheck
import * as lamejsModule from 'lamejs';

// Robust wrapper for lamejs in various module environments
const lamejs = (lamejsModule as any).default || lamejsModule;

export interface CompressionProgress {
  stage: 'decoding' | 'converting' | 'encoding' | 'done' | 'error';
  percent: number;
  message: string;
}

export interface CompressionOptions {
  bitrate?: number;
  forceMono?: boolean;
  onProgress?: (progress: CompressionProgress) => void;
}

export async function compressAudio(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    bitrate = 64,
    forceMono = true,
    onProgress
  } = options;

  const updateProgress = (stage: CompressionProgress['stage'], percent: number, message: string) => {
    if (onProgress) {
      onProgress({ stage, percent: Math.round(percent), message });
    }
  };

  updateProgress('decoding', 5, 'Reading audio file...');

  const fileReader = new FileReader();
  const arrayBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
    fileReader.onerror = () => reject(new Error('Failed to read audio file.'));
  });
  fileReader.readAsArrayBuffer(file);
  const arrayBuffer = await arrayBufferPromise;

  updateProgress('decoding', 25, 'Decoding audio format natively in browser...');

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Your browser does not support Web Audio API decoding.');
  }

  const audioCtx = new AudioContextClass();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error('Audio decoding failed:', err);
    throw new Error('Could not decode audio. Make sure the file is a valid audio format.');
  } finally {
    await audioCtx.close();
  }

  updateProgress('converting', 0, 'Analyzing audio channels...');

  const inputChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const outChannels = forceMono ? 1 : Math.min(inputChannels, 2);

  const durationSec = audioBuffer.duration;
  console.log(`[Audio Compressor] Decoded audio: ${durationSec.toFixed(1)}s, ${inputChannels} ch, ${sampleRate}Hz`);

  updateProgress('converting', 40, 'Preparing audio channel buffers...');
  
  let leftData: Float32Array;
  let rightData: Float32Array | null = null;

  if (outChannels === 1) {
    leftData = audioBuffer.getChannelData(0);
    if (inputChannels > 1) {
      const rightIn = audioBuffer.getChannelData(1);
      const monoData = new Float32Array(leftData.length);
      for (let i = 0; i < leftData.length; i++) {
        monoData[i] = (leftData[i] + rightIn[i]) / 2;
      }
      leftData = monoData;
    }
  } else {
    leftData = audioBuffer.getChannelData(0);
    rightData = audioBuffer.getChannelData(1);
  }

  updateProgress('encoding', 0, 'Initializing MP3 compressor...');
  
  const validBitrate = [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320].includes(bitrate)
    ? bitrate
    : 64;

  const mp3encoder = new lamejs.Mp3Encoder(outChannels, sampleRate, validBitrate);
  const mp3DataChunks: Uint8Array[] = [];

  const totalSamples = leftData.length;
  const chunkSize = 1152 * 20;
  let offset = 0;

  updateProgress('encoding', 5, `Compressing audio stream to ${validBitrate}kbps MP3...`);

  const floatToInt16 = (floatArr: Float32Array, start: number, length: number): Int16Array => {
    const intArr = new Int16Array(length);
    for (let i = 0; i < length; i++) {
      const s = Math.max(-1, Math.min(1, floatArr[start + i]));
      intArr[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return intArr;
  };

  while (offset < totalSamples) {
    const currentChunkSize = Math.min(chunkSize, totalSamples - offset);
    
    const leftPCM = floatToInt16(leftData, offset, currentChunkSize);
    let mp3buffer: any;

    if (outChannels === 2 && rightData) {
      const rightPCM = floatToInt16(rightData, offset, currentChunkSize);
      mp3buffer = mp3encoder.encodeBuffer(leftPCM, rightPCM);
    } else {
      mp3buffer = mp3encoder.encodeBuffer(leftPCM);
    }

    if (mp3buffer.length > 0) {
      mp3DataChunks.push(new Uint8Array(mp3buffer));
    }

    offset += currentChunkSize;
    const percent = (offset / totalSamples) * 100;
    
    updateProgress('encoding', percent, `Compressing audio stream (${Math.round(percent)}%)...`);

    await new Promise(resolve => setTimeout(resolve, 0));
  }

  updateProgress('encoding', 98, 'Finalizing audio compression...');
  const mp3bufferFlush = mp3encoder.flush();
  if (mp3bufferFlush.length > 0) {
    mp3DataChunks.push(new Uint8Array(mp3bufferFlush));
  }

  // 7. Create compressed file
  const mp3Blob = new Blob(mp3DataChunks as BlobPart[], { type: 'audio/mp3' });
  
  const originalNameNoExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const compressedFileName = `${originalNameNoExt}_compressed.mp3`;

  const compressedFile = new File([mp3Blob], compressedFileName, {
    type: 'audio/mp3',
    lastModified: Date.now()
  });

  const originalSizeMb = (file.size / (1024 * 1024)).toFixed(2);
  const compressedSizeMb = (compressedFile.size / (1024 * 1024)).toFixed(2);
  const ratio = ((1 - compressedFile.size / file.size) * 100).toFixed(0);

  updateProgress('done', 100, `Successfully compressed from ${originalSizeMb}MB to ${compressedSizeMb}MB (Saved ${ratio}%)!`);
  console.log(`[Audio Compressor] Complete. Saved ${ratio}%! New size: ${compressedSizeMb}MB`);

  return compressedFile;
}
