import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { churchService } from '../../services/churchService';
import { GalleryImage } from '../../types';
import { getImageUrl } from '../../lib/image-utils';
import { 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Calendar, 
  Maximize2 
} from 'lucide-react';

export default function Gallery() {
  useDocumentMeta({
    title: 'Photo Gallery',
    description: 'Explore pictures of our Sunday services, community reaches, conferences, and youth ministries at New Nature in Christ Ministry.',
    keywords: 'photo gallery, church gallery, NNCM photos, Malawi church pictures, Zomba ministry'
  });

  const { settings } = useOrgSettings();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadGallery() {
      try {
        setLoading(true);
        const data = await churchService.gallery.getAll();
        // Sort by date newest first
        const sorted = [...data].sort((a, b) => b.createdAt - a.createdAt);
        setImages(sorted);
      } catch (err) {
        console.error('Error loading gallery images:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  // Extract unique categories dynamically, maintaining a default set just in case
  const categories = ['All', ...Array.from(new Set(images.map(img => img.category || 'Sunday Service')))];

  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => (img.category || 'Sunday Service') === selectedCategory);

  const openLightbox = (url: string) => {
    const index = filteredImages.findIndex(img => img.url === url);
    if (index !== -1) {
      setLightboxIndex(index);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const navigateLightbox = (direction: 'next' | 'prev') => {
    if (lightboxIndex === null) return;
    
    let newIndex = lightboxIndex;
    if (direction === 'next') {
      newIndex = (lightboxIndex + 1) % filteredImages.length;
    } else {
      newIndex = (lightboxIndex - 1 + filteredImages.length) % filteredImages.length;
    }
    setLightboxIndex(newIndex);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateLightbox('next');
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredImages]);

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans dark:bg-[#030712]">
      {/* Hero Banner Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black tracking-widest uppercase mb-4"
          >
            <Camera className="w-3.5 h-3.5" /> Sanctuary Moments
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-display font-black tracking-tight text-slate-900 dark:text-white"
          >
            Our Photo Gallery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-4 leading-relaxed"
          >
            A visual documentation of God's grace in action across Zomba, Malawi. Explore snapshots of Sunday celebration assemblies, impactful outdoor crusades, life-giving groups, and youth events.
          </motion.p>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
          {categories.map((category) => (
            <button
              id={`filter-btn-${category.toLowerCase().replace(/\s+/g, '-')}`}
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs font-extrabold tracking-wide transition-all rounded-full cursor-pointer ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/60'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Gallery Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          // Shimmer loading cards
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 2].map((n, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/60 h-80 animate-pulse">
                <div className="bg-slate-200 dark:bg-slate-800 h-2/3 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl max-w-xl mx-auto">
            <Camera className="w-12 h-12 text-slate-350 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No images found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">No photos have been added to this category yet.</p>
          </div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  id={`gallery-item-${image.id}`}
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/60 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-indigo-950/10 transition-all duration-300"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                    {failedImages[image.id] ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/60 text-slate-400 p-4 text-center">
                        <Camera className="w-8 h-8 mb-2 stroke-1 text-indigo-500/80 dark:text-indigo-400/80" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Image offline</span>
                        <span className="text-[9px] text-slate-400 break-all leading-tight mt-1 truncate max-w-full px-2" title={image.url}>{image.title}</span>
                      </div>
                    ) : (
                      <img 
                        src={getImageUrl(image.url)} 
                        alt={image.title} 
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          setFailedImages(prev => ({ ...prev, [image.id]: true }));
                        }}
                      />
                    )}
                    {/* Hover mask */}
                    <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        id={`zoom-btn-${image.id}`}
                        onClick={() => openLightbox(image.url)}
                        className="p-3 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 cursor-pointer"
                        title="View Full Resolution"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Category pill */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur dark:bg-slate-900/90 py-1.5 px-3 rounded-full text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider shadow">
                      {image.category || 'Sunday Service'}
                    </div>
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {image.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-slate-350 dark:text-slate-600" />
                      {new Date(image.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            id="gallery-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between"
          >
            {/* Header controls inside lightbox */}
            <div className="w-full h-20 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
              <div className="text-white">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-950/60 leading-none px-2.5 py-1.5 rounded-md">
                  {filteredImages[lightboxIndex].category || 'Sunday Service'}
                </span>
                <h4 className="text-sm font-bold text-slate-200 mt-1">{filteredImages[lightboxIndex].title}</h4>
              </div>
              <button 
                id="close-lightbox-btn"
                onClick={closeLightbox} 
                className="p-3 bg-white/10 hover:bg-rose-600/30 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-white/10 hover:border-rose-500/30"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Core viewing container */}
            <div className="relative flex-1 flex items-center justify-center px-4">
              {/* Back trigger */}
              <button
                id="prev-lightbox-btn"
                onClick={() => navigateLightbox('prev')}
                className="absolute left-6 z-15 p-3.5 bg-black/40 hover:bg-indigo-600 text-white border border-white/5 rounded-full transition-all active:scale-90 cursor-pointer hidden md:block"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Main photo display */}
              <motion.div 
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="max-h-[72vh] max-w-[85vw] flex items-center justify-center select-none"
              >
                <img 
                  src={getImageUrl(filteredImages[lightboxIndex].url)} 
                  alt={filteredImages[lightboxIndex].title} 
                  className="max-h-[72vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Next trigger */}
              <button
                id="next-lightbox-btn"
                onClick={() => navigateLightbox('next')}
                className="absolute right-6 z-15 p-3.5 bg-black/40 hover:bg-indigo-600 text-white border border-white/5 rounded-full transition-all active:scale-90 cursor-pointer hidden md:block"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Counter & Info Block */}
            <div className="w-full p-6 text-center select-none bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center gap-3">
              {/* Mobile back/next swipe triggers */}
              <div className="flex gap-4 md:hidden">
                <button
                  id="mobile-prev-btn"
                  onClick={() => navigateLightbox('prev')}
                  className="px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-full border border-white/10"
                >
                  Prev
                </button>
                <button
                  id="mobile-next-btn"
                  onClick={() => navigateLightbox('next')}
                  className="px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-full border border-white/10"
                >
                  Next
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-extrabold tracking-[0.25em] uppercase">
                IMAGE {lightboxIndex + 1} OF {filteredImages.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
