import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2, Music, Check, Settings, Sparkles, X, Sliders } from 'lucide-react';
import { uploadFileToSupabase } from '../lib/storage';
import { compressAudio, CompressionProgress } from '../lib/audio-compression';
import { toast } from 'sonner';

interface NativeFileUploadProps {
  onUpload: (url: string, fileName: string, size: number, type: string) => void;
  buttonText?: string;
  acceptTypes?: string;
  maxSize?: number; // bytes
  folder?: string;
}

export default function NativeFileUpload({
  onUpload,
  buttonText = "Upload File",
  acceptTypes = "image/*,application/pdf",
  maxSize = 10000000, // 10MB
  folder = 'general'
}: NativeFileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio optimizer states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState<number>(64); // default 64kbps (Speech/Sermon optimized)
  const [forceMono, setForceMono] = useState<boolean>(true); // default mono (halves size)
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);

  const isAudioFile = (file: File): boolean => {
    return file.type.startsWith('audio/') || 
      /\.(mp3|wav|m4a|aac|ogg|webm|flac|3gp|mp4)$/i.test(file.name);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize && !isAudioFile(file)) {
      setErrorMsg(`File too large. Max size is ${maxSize / 1000000}MB`);
      return;
    }

    setErrorMsg(null);
    setShowSuccess(false);

    // If it's an audio file, open the client-side compressor/optimizer panel
    if (isAudioFile(file)) {
      setSelectedFile(file);
      // Reset progress
      setCompressionProgress(null);
      return;
    }

    // Direct upload for images, PDFs, etc.
    await uploadDirectly(file);
  };

  const uploadDirectly = async (fileToUpload: File) => {
    setLoading(true);
    setErrorMsg(null);
    setShowSuccess(false);

    try {
      const result = await uploadFileToSupabase(fileToUpload, folder);

      onUpload(result.url, fileToUpload.name, fileToUpload.size, fileToUpload.type);
      setShowSuccess(true);
      
      if (result.fallback) {
        console.warn("[Storage Fallback Active]", result.errorMsg);
        toast.info("Processed as highly persistent Base64 fallback in this workspace.");
      } else {
        toast.success("File uploaded successfully.");
      }

      // Clear success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Failed to upload file to backend.");
      toast.error("File upload failed, using memory fallback.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOptimizeAndUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setErrorMsg(null);
    setCompressionProgress({
      stage: 'decoding',
      percent: 0,
      message: 'Preparing audio optimizer...'
    });

    try {
      // Run the pure-JS client-side compressor
      const compressed = await compressAudio(selectedFile, {
        bitrate,
        forceMono,
        onProgress: (progress) => {
          setCompressionProgress(progress);
        }
      });

      // Upload the newly compressed file
      await uploadDirectly(compressed);
      
      // Clean up states on success
      setSelectedFile(null);
      setCompressionProgress(null);
    } catch (err: any) {
      console.error("Audio compression failed:", err);
      toast.error(`Compression failed: ${err.message || 'Error occurred'}. Uploading original instead...`);
      
      // Fallback: upload original file directly if compression fails (prevents blockages)
      await uploadDirectly(selectedFile);
      setSelectedFile(null);
      setCompressionProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelAudioProcess = () => {
    setSelectedFile(null);
    setCompressionProgress(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptTypes}
          className="hidden"
          id={`native-upload-${buttonText.replace(/\s+/g, '-').toLowerCase()}`}
        />
        
        {!selectedFile && (
          <label
            htmlFor={`native-upload-${buttonText.replace(/\s+/g, '-').toLowerCase()}`}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer ${
              loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-900' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{loading ? "Processing..." : buttonText}</span>
          </label>
        )}

        {showSuccess && !selectedFile && (
          <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold gap-1 animate-in fade-in slide-in-from-left-2">
            <CheckCircle className="w-3.5 h-3.5" />
            File Uploaded!
          </span>
        )}
      </div>

      {/* Modern Client-Side Audio Compression Setting Panel */}
      {selectedFile && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 animate-in fade-in zoom-in-95 duration-200 space-y-3.5 w-full max-w-md">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Audio Optimizer</h4>
                <p className="text-[10px] text-slate-400">Client-Side Compression</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={cancelAudioProcess}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title={selectedFile.name}>
              {selectedFile.name}
            </p>
            <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
              <span>Original Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              <span>•</span>
              <span className="uppercase">{selectedFile.name.split('.').pop() || 'unknown'}</span>
            </div>
          </div>

          {!compressionProgress ? (
            <div className="space-y-3">
              {/* Settings Controls */}
              <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Settings className="w-3 h-3 text-slate-400" />
                    Target Bitrate
                  </label>
                  <select
                    value={bitrate}
                    onChange={(e) => setBitrate(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value={32}>32 kbps (Ultra Small)</option>
                    <option value={64}>64 kbps (Sermon/Voice)</option>
                    <option value={96}>96 kbps (Standard)</option>
                    <option value={128}>128 kbps (Good Quality)</option>
                    <option value={192}>192 kbps (High Quality)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    Channel Mode
                  </label>
                  <select
                    value={forceMono ? 'mono' : 'stereo'}
                    onChange={(e) => setForceMono(e.target.value === 'mono')}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="mono">Convert to Mono (Saves 50% size)</option>
                    <option value="stereo">Keep Stereo</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleOptimizeAndUpload}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Compress & Upload
                </button>
                <button
                  type="button"
                  onClick={() => uploadDirectly(selectedFile)}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl py-2 px-3 text-xs font-medium"
                >
                  Skip Compression
                </button>
              </div>
            </div>
          ) : (
            /* Progress State */
            <div className="space-y-2 bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900 animate-pulse">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{compressionProgress.message}</span>
                <span className="font-bold text-slate-500 font-mono">{compressionProgress.percent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-150" 
                  style={{ width: `${compressionProgress.percent}%` }}
                />
              </div>
              {compressionProgress.stage === 'encoding' && (
                <p className="text-[9px] text-slate-400 italic text-center">
                  Encoding with LAME MP3 Encoder. Please do not close your browser tab...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2 border border-red-100 dark:border-red-950/40 w-full max-w-md">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
