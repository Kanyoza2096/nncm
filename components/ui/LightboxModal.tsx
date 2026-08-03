// components/ui/LightboxModal.tsx
import { useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'

interface LightboxModalProps {
  imageUrl: string
  onClose: () => void
}

export default function LightboxModal({ imageUrl, onClose }: LightboxModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 md:-right-12 bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-full transition-colors z-50 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close image viewer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <img
          src={imageUrl}
          alt="Expanded view"
          className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        />

        <p className="text-white/40 text-xs mt-3 font-mono">
          Press Escape or click anywhere to close
        </p>
      </div>
    </motion.div>
  )
}
