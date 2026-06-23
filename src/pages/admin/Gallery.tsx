import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  X, 
  Image as ImageIcon,
  Heart,
  Grid,
  Sparkles,
  Link as LinkIcon,
  Loader2,
  Upload,
  CheckCircle,
  AlertCircle,
  FileImage,
  FolderOpen,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { churchService } from '../../services/churchService';
import { GalleryImage } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { uploadFileToSupabase } from '../../lib/storage';

const CATEGORIES = [
  'Sunday Service',
  'Fellowship & Meetings',
  'Youth',
  'Crusade & Outreaches',
  'Special Events'
];

interface PendingImage {
  id: string;
  file: File;
  objectUrl: string;
  title: string;
  category: string;
  customCategory?: string;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  uploadedUrl?: string;
  error?: string;
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [uploadTab, setUploadTab] = useState<'device' | 'url'>('device');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deletion confirmation states
  const [deleteConfirmImg, setDeleteConfirmImg] = useState<GalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Single URL Upload State
  const [singleFormData, setSingleFormData] = useState({
    title: '',
    category: 'Sunday Service',
    customCategory: '',
    url: ''
  });

  // Multiple Files Pending Upload State
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [globalCategory, setGlobalCategory] = useState('Sunday Service');
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);

  // Preset suggestions for URL tab
  const imagePresets = [
    { title: 'Worship Sunday Service', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Community Outreach Service', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Youth Flame Ministry Rehearsal', url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Sanctuary Choir Praise', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=1200&q=80' }
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await churchService.gallery.getAll();
      setImages(data);
    } catch (err) {
      toast.error('Could not reach photographic archives.');
    } finally {
      setLoading(false);
    }
  };

  // Turn file name into beautiful capitalize spaced title
  const cleanFileNameToTitle = (filename: string): string => {
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    return nameWithoutExt
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleDeviceFilesSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPending: PendingImage[] = Array.from(files).map(file => {
      const objectUrl = URL.createObjectURL(file);
      const formattedTitle = cleanFileNameToTitle(file.name);
      return {
        id: 'pending-' + Math.random().toString(36).substring(2, 9),
        file,
        objectUrl,
        title: formattedTitle,
        category: globalCategory,
        status: 'pending'
      };
    });

    setPendingImages(prev => [...prev, ...newPending]);
    toast.success(`Enrolled ${newPending.length} local photos into the pending slider.`);
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePendingImage = (id: string, objUrl: string) => {
    URL.revokeObjectURL(objUrl);
    setPendingImages(prev => prev.filter(img => img.id !== id));
  };

  const handleUpdatePendingTitle = (id: string, newTitle: string) => {
    setPendingImages(prev => prev.map(img => img.id === id ? { ...img, title: newTitle } : img));
  };

  const handleUpdatePendingCategory = (id: string, key: string, custom?: string) => {
    setPendingImages(prev => prev.map(img => {
      if (img.id === id) {
        return { 
          ...img, 
          category: key,
          customCategory: custom !== undefined ? custom : img.customCategory 
        };
      }
      return img;
    }));
  };

  const handleSelectPreset = (url: string, titleHint: string) => {
    setSingleFormData(prev => ({
      ...prev,
      url,
      title: prev.title || titleHint
    }));
    toast.success('Suggested preset photo details loaded into form.');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmImg) return;
    setIsDeleting(true);
    try {
      await churchService.gallery.delete(deleteConfirmImg.id);
      toast.success('Photographic proof archived and removed.');
      setDeleteConfirmImg(null);
      fetchImages();
    } catch (err) {
      toast.error('Archive operation aborted.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Submit multiple batch files uploaded
  const handleUploadAndCommitBatch = async () => {
    if (pendingImages.length === 0) {
      toast.error('Pick at least one photos file first.');
      return;
    }

    const uncompleted = pendingImages.filter(img => img.status !== 'success');
    if (uncompleted.length === 0) {
      toast.error('All files already completed.');
      return;
    }

    setIsUploadingBatch(true);
    let successCount = 0;
    
    // We upload each file sequentially or in parallel depending on response states
    const uploadPromises = pendingImages.map(async (pendingImg) => {
      if (pendingImg.status === 'success') return;

      // set progress uploading
      setPendingImages(prev => prev.map(img => img.id === pendingImg.id ? { ...img, status: 'uploading' } : img));

      try {
        // Upload binary block to Supabase Storage or persistent base64 schema
        const result = await uploadFileToSupabase(pendingImg.file, 'gallery');

        const finalCategory = pendingImg.category === 'Custom' 
          ? (pendingImg.customCategory?.trim() || 'Sunday Service')
          : pendingImg.category;

        // save to localStorage API registry
        await churchService.gallery.create({
          title: pendingImg.title.trim() || 'Sanctuary Scene Capture',
          category: finalCategory,
          url: result.url
        });

        successCount++;
        setPendingImages(prev => prev.map(img => {
          if (img.id === pendingImg.id) {
            return { ...img, status: 'success', uploadedUrl: result.url };
          }
          return img;
        }));
      } catch (err: any) {
        console.error("Batch upload failed for element", pendingImg.title, err);
        setPendingImages(prev => prev.map(img => {
          if (img.id === pendingImg.id) {
            return { ...img, status: 'failed', error: err.message || 'Transmission error' };
          }
          return img;
        }));
      }
    });

    await Promise.all(uploadPromises);
    setIsUploadingBatch(false);

    if (successCount > 0) {
      toast.success(`Grace received! ${successCount} photos uploaded & registered successfully!`);
      fetchImages();
      
      // Clean successful ones from current view
      setPendingImages(prev => {
        // Revoke URLs for success items to save browser memory
        prev.forEach(img => {
          if (img.status === 'success') URL.revokeObjectURL(img.objectUrl);
        });
        return prev.filter(img => img.status !== 'success');
      });

      // If everything successfully finished, close modal drawer
      const failedCount = pendingImages.length - successCount;
      if (failedCount === 0) {
        setShowForm(false);
      } else {
        toast.error(`${failedCount} files failed to submit. Please review or retry them.`);
      }
    } else {
      toast.error('Bulk transmission failed entirely.');
    }
  };

  // Submit single URL form
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = singleFormData.category === 'Custom' 
      ? (singleFormData.customCategory.trim() || 'Sunday Service') 
      : singleFormData.category;

    if (!singleFormData.title.trim()) {
      toast.error('Please specify a title caption.');
      return;
    }

    if (!singleFormData.url.trim()) {
      toast.error('The image address/URL is mandatory.');
      return;
    }

    try {
      await churchService.gallery.create({
        title: singleFormData.title.trim(),
        category: finalCategory,
        url: singleFormData.url.trim()
      });

      toast.success('Sanctified scene registered with database.');
      setShowForm(false);
      setSingleFormData({
        title: '',
        category: 'Sunday Service',
        customCategory: '',
        url: ''
      });
      fetchImages();
    } catch (err) {
      toast.error('Moment registration failed.');
    }
  };

  // Apply batch global category to all pending images
  const applyGlobalCategoryToPending = (cat: string) => {
    setGlobalCategory(cat);
    setPendingImages(prev => prev.map(img => ({ ...img, category: cat })));
    toast.info(`Updated category tag of all pending photos to "${cat}".`);
  };

  const categoriesList = ['All', ...Array.from(new Set(images.map(img => img.category || 'Sunday Service')))];

  const filtered = images.filter(img => {
    const matchesSearch = img.title.toLowerCase().includes(search.toLowerCase()) || 
      (img.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (img.category || 'Sunday Service') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans dark:text-slate-100">
      
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-indigo-600" /> Photo & Video Library
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Administer public archives, outreaches, youth milestones, and miraculous crusades visually.
          </p>
        </div>
        
        <button 
          onClick={() => {
            // Clean up any old object URLs to avoid memory leaks
            pendingImages.forEach(img => URL.revokeObjectURL(img.objectUrl));
            setPendingImages([]);
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Upload / Register Photos
        </button>
      </div>

      {/* Mini state counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Grid className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Gallery Assets</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">{images.length} Captured</h4>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-lg">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Active Dimensions</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">
            {Math.max(0, categoriesList.length - 1)} Dimension groups
          </h4>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Visibility status</span>
          </div>
          <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Live Online Synchronized</h4>
        </div>
      </div>

      {/* Main Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/40 dark:bg-slate-800/30">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search photostream by title or category..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Image Grid */}
        <div className="p-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-extrabold tracking-widest text-xs uppercase animate-pulse flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-505 text-indigo-500 animate-spin" /> Fetching photostream catalog...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500">
              <Camera className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-350" />
              <p className="text-xs font-bold uppercase tracking-widest">No pictures match searching filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map(img => (
                <div 
                  key={img.id}
                  className="group relative bg-slate-50 dark:bg-slate-950/40 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-slate-900">
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-indigo-600/90 dark:bg-indigo-900/90 rounded-md text-[9px] font-black uppercase text-white tracking-widest">
                      {img.category || 'Sunday Service'}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between h-28">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-150 text-xs tracking-tight line-clamp-1">
                        {img.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(img.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-indigo-950/20 pt-2.5 mt-2.5">
                      <a 
                        href={img.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black tracking-wider uppercase hover:underline"
                      >
                        Enlarge URL
                      </a>
                      <button 
                        onClick={() => setDeleteConfirmImg(img)}
                        className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        title="Archive Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Sidebar Drawer with full Mobile-Direct Upload and Multi-file list editors */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-45 bg-[#020617]/60 backdrop-blur-sm flex justify-end">
            
            {/* Backdrop Closer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => {
                if (isUploadingBatch) {
                  toast.warning('File upload is actively processing.');
                  return;
                }
                setShowForm(false);
              }}
            />

            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col overflow-hidden z-10"
            >
              
              {/* Drawer Title Block */}
              <div className="p-6 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-indigo-600" /> New Gallery Pictures
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Upload local phone photos or load external web paths.</p>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  disabled={isUploadingBatch}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl transition-all cursor-pointer border border-transparent disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Selection Mode Tab Swapper */}
              <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-4 justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setUploadTab('device')}
                    className={`px-4 py-2 text-xs font-extrabold rounded-lg tracking-wide transition-all ${
                      uploadTab === 'device'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-105'
                    }`}
                  >
                    Direct Upload (Phone/Device Storage)
                  </button>
                  <button
                    onClick={() => setUploadTab('url')}
                    className={`px-4 py-2 text-xs font-extrabold rounded-lg tracking-wide transition-all ${
                      uploadTab === 'url'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-105'
                    }`}
                  >
                    Image Web link (Unsplash / Presets)
                  </button>
                </div>

                <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800 px-2.5 py-1 text-slate-600 dark:text-slate-400 rounded-md font-bold">
                  {uploadTab === 'device' ? 'Multi Support' : 'Single link'}
                </span>
              </div>

              {/* Form Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. DEVICE DIRECT / MULTI-UPLOAD TAB */}
                {uploadTab === 'device' && (
                  <div className="space-y-6">
                    
                    {/* Native file picker input box supporting multiple images */}
                    <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center bg-slate-50/55 dark:bg-slate-950/30 hover:bg-slate-100/50 dark:hover:bg-slate-950/50 transition-colors relative group">
                      
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleDeviceFilesSelection}
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Click or Tap to select multiple files"
                      />

                      <div className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>

                      <div className="max-w-md mx-auto mt-4">
                        <p className="text-sm font-black text-slate-800 dark:text-slate-150">
                          Select Photos from device storage
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                          Tap here to browse your phone's camera roll or computer files. You can select **multiple files** (PNG, JPEG, HEIC, WebP up to 10MB each).
                        </p>
                      </div>

                      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/40 text-[10px] font-black text-indigo-600 dark:text-indigo-400 rounded-lg uppercase tracking-wider">
                        <FolderOpen className="w-3.5 h-3.5" /> Tap & Browse Local Storage
                      </div>
                    </div>

                    {/* Batch config settings tools */}
                    {pendingImages.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs text-slate-505 text-slate-500 dark:text-slate-400 font-extrabold flex items-center gap-1.5">
                          <SlidersHorizontal className="w-4 h-4 text-slate-450" /> Set all pending photos to:
                        </span>
                        
                        <div className="flex gap-2">
                          <select
                            value={globalCategory}
                            onChange={(e) => applyGlobalCategoryToPending(e.target.value)}
                            className="px-3 py-1.5 text-xs font-extrabold bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg cursor-pointer max-w-sm"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Pending Upload Files Edit Cards List slider */}
                    <div className="space-y-4">
                      
                      {pendingImages.length > 0 && (
                        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest pl-1">
                          Photos Queue ({pendingImages.length} pending files)
                        </h3>
                      )}

                      <AnimatePresence initial={false}>
                        {pendingImages.map((img) => (
                          <motion.div
                            key={img.id}
                            initial={{ opacity: 0, height: 0, y: 15 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 flex gap-4 items-start relative group"
                          >
                            {/* Drag Thumbnail */}
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 relative">
                              <img 
                                src={img.objectUrl} 
                                alt="Draft local file" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              
                              {/* Overlay pending/uploading loading indicators */}
                              {img.status === 'uploading' && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                </div>
                              )}

                              {img.status === 'success' && (
                                <div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center">
                                  <CheckCircle className="w-6 h-6 text-emerald-450 text-emerald-450 text-emerald-400" />
                                </div>
                              )}

                              {img.status === 'failed' && (
                                <div className="absolute inset-0 bg-red-950/75 flex items-center justify-center">
                                  <AlertCircle className="w-6 h-6 text-red-500" />
                                </div>
                              )}
                            </div>

                            {/* Core meta editors */}
                            <div className="flex-1 space-y-2.5 min-w-0">
                              
                              {/* Editable Title input */}
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block pl-0.5">Captions Title ({Math.round(img.file.size/1024)} KB)</span>
                                <input 
                                  type="text"
                                  value={img.title}
                                  onChange={e => handleUpdatePendingTitle(img.id, e.target.value)}
                                  disabled={img.status === 'uploading' || img.status === 'success'}
                                  placeholder="Moment Description Caption, e.g. Sunday Miracle Praise"
                                  className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white outline-none focus:border-indigo-500 disabled:opacity-55"
                                  required
                                />
                              </div>

                              {/* Editable Category Selection & Custom text override */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block pl-0.5">Category</span>
                                  <select
                                    value={img.category}
                                    onChange={e => handleUpdatePendingCategory(img.id, e.target.value)}
                                    disabled={img.status === 'uploading' || img.status === 'success'}
                                    className="w-full px-2.5 py-1.5 text-[11px] font-bold bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-300 cursor-pointer outline-none touch-manipulation"
                                  >
                                    {CATEGORIES.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                    <option value="Custom">Custom Group...</option>
                                  </select>
                                </div>

                                {img.category === 'Custom' && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Custom Name</span>
                                    <input 
                                      type="text"
                                      value={img.customCategory || ''}
                                      onChange={e => handleUpdatePendingCategory(img.id, 'Custom', e.target.value)}
                                      disabled={img.status === 'uploading' || img.status === 'success'}
                                      placeholder="e.g. Easter Special"
                                      className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                  </div>
                                )}
                              </div>

                              {img.error && (
                                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                  <AlertCircle className="w-3 h-3" /> {img.error}
                                </p>
                              )}

                            </div>

                            {/* Trash button helper */}
                            {img.status !== 'success' && img.status !== 'uploading' && (
                              <button
                                type="button"
                                onClick={() => removePendingImage(img.id, img.objectUrl)}
                                className="p-1 px-2.5 self-center text-slate-400 hover:text-red-500 border border-slate-100 hover:border-red-150 rounded-lg transition-colors cursor-pointer"
                                title="Exclude file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {pendingImages.length === 0 && (
                        <div className="py-12 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-slate-405 dark:text-slate-600 gap-2">
                          <FileImage className="w-10 h-10 stroke-1 text-slate-350" />
                          <p className="text-xs font-bold uppercase tracking-widest">No local files chosen yet</p>
                        </div>
                      )}

                    </div>

                  </div>
                )}

                {/* 2. EXTERNAL URL PASTE/PRESETS TAB */}
                {uploadTab === 'url' && (
                  <form onSubmit={handleSingleSubmit} className="space-y-5">
                    
                    {/* Caption Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest pl-1">
                        Caption Title / Moment
                      </label>
                      <input 
                        type="text"
                        value={singleFormData.title}
                        onChange={e => setSingleFormData({ ...singleFormData, title: e.target.value })}
                        placeholder="e.g. Sunday Miracle Youth Revival"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
                        required
                      />
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest pl-1">
                        Event Category Tag
                      </label>
                      <select
                        value={singleFormData.category}
                        onChange={e => setSingleFormData({ ...singleFormData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
                      >
                        {CATEGORIES.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="Custom">Custom Dimension Group...</option>
                      </select>
                    </div>

                    {/* Custom Category Tag Input */}
                    {singleFormData.category === 'Custom' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5 pl-2 border-l-2 border-indigo-600"
                      >
                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                          Define Custom Tag
                        </label>
                        <input 
                          type="text"
                          value={singleFormData.customCategory}
                          onChange={e => setSingleFormData({ ...singleFormData, customCategory: e.target.value })}
                          placeholder="e.g. Children Assembly"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
                          required
                        />
                      </motion.div>
                    )}

                    {/* Image URL Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest pl-1">
                        Public Image Web URL
                      </label>
                      <div className="relative">
                        <input 
                          type="url"
                          value={singleFormData.url}
                          onChange={e => setSingleFormData({ ...singleFormData, url: e.target.value })}
                          placeholder="https://images.unsplash.com/photo-example-12345"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
                          required
                        />
                        <LinkIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Presets suggestions select box */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 tracking-widest pl-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Suggested Curated Stock Presets
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {imagePresets.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectPreset(p.url, p.title)}
                            className="p-2 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-600 hover:bg-indigo-50/20 text-slate-650 dark:text-slate-400 text-[10px] font-semibold text-left rounded-lg truncate flex items-center gap-1.5 transition-all outline-none"
                          >
                            <ImageIcon className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{p.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* URL Image preview box */}
                    {singleFormData.url && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 aspect-video overflow-hidden mt-4 bg-slate-100"
                      >
                        <img 
                          src={singleFormData.url} 
                          alt="Web validation preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            toast.error('Provided URL does not resolve to an accessible image.');
                          }} 
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    )}

                    {/* Commit URL trigger */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setShowForm(false)} 
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-650 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
                      >
                        Register Web image
                      </button>
                    </div>

                  </form>
                )}

              </div>

              {/* Drawer batch uploading actions footer */}
              {uploadTab === 'device' && (
                <div className="p-6 border-t border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => {
                      pendingImages.forEach(img => URL.revokeObjectURL(img.objectUrl));
                      setPendingImages([]);
                    }}
                    disabled={pendingImages.length === 0 || isUploadingBatch}
                    className="flex-1 py-3.5 bg-slate-200 hover:bg-slate-250 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Clear Slate
                  </button>
                  <button 
                    onClick={handleUploadAndCommitBatch}
                    disabled={pendingImages.length === 0 || isUploadingBatch}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploadingBatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Group...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload & Commit All ({pendingImages.length})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal to bypass native iframe confirm blocks */}
      <AnimatePresence>
        {deleteConfirmImg && (
          <div className="fixed inset-0 z-50 bg-[#020617]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" /> Confirm Archival Delete
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-2.5 leading-relaxed">
                Are you sure you want to delete <span className="font-extrabold text-slate-800 dark:text-slate-200">"{deleteConfirmImg.title}"</span>? This will permanently remove the record from the public gallery stream.
              </p>

              {deleteConfirmImg.url && (
                <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100">
                  <img src={deleteConfirmImg.url} alt={deleteConfirmImg.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmImg(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
