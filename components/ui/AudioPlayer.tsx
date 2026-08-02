// components/ui/AudioPlayer.tsx
import { Music, Disc, Pause } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  title: string
  isDemo?: boolean
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
}

export default function AudioPlayer({
  audioUrl,
  title,
  isDemo = false,
  isPlaying,
  onPlay,
  onStop,
}: AudioPlayerProps) {
  return (
    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-bold">
        {isDemo ? (
          <span className="flex items-center gap-1 text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
            <span>Demo Audio</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-emerald-600">
            <Music className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sermon Audio</span>
          </span>
        )}
        {isPlaying && (
          <span className="text-indigo-600 animate-pulse text-[9px]">● STREAMING</span>
        )}
      </div>

      <audio
        controls
        onPlay={onPlay}
        onPause={onStop}
        onEnded={onStop}
        className="w-full h-8 accent-indigo-600 rounded-lg"
        src={audioUrl}
        preload="none"
        aria-label={`Audio player for ${title}`}
      >
        Your browser does not support audio playback.
      </audio>

      <button
        type="button"
        onClick={isPlaying ? onStop : onPlay}
        className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label={isPlaying ? `Stop playing ${title}` : `Play ${title}`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            Stop Playback
          </>
        ) : (
          <>
            <Disc className="w-3.5 h-3.5" aria-hidden="true" />
            Play Audio
          </>
        )}
      </button>
    </div>
  )
}
