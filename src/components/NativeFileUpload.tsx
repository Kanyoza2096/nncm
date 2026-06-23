import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadFileToSupabase } from '../lib/storage';
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      setErrorMsg(`File too large. Max size is ${maxSize / 1000000}MB`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setShowSuccess(false);

    try {
      // Pass the folder/bucket category to route upload specifically to logos, avatars, projects, reports, or attachments
      const result = await uploadFileToSupabase(file, folder);

      onUpload(result.url, file.name, file.size, file.type);
      setShowSuccess(true);
      
      if (result.fallback) {
        console.warn("[Storage Fallback Active]", result.errorMsg);
        toast.info("Image processed as highly persistent Base64 fallback in this workspace.");
      } else {
        toast.success("File uploaded to Supabase Storage successfully.");
      }

      // Clear success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Failed to upload file to backend.");
      toast.error("File upload failed, using memory fallback.");
    } finally {
      setLoading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptTypes}
          className="hidden"
          id={`native-upload-${buttonText.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label
          htmlFor={`native-upload-${buttonText.replace(/\s+/g, '-').toLowerCase()}`}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer ${
            loading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{loading ? "Processing..." : buttonText}</span>
        </label>

        {showSuccess && (
          <span className="flex items-center text-xs text-emerald-600 font-semibold gap-1 animate-in fade-in slide-in-from-left-2">
            <CheckCircle className="w-3.5 h-3.5" />
            File Uploaded!
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2 border border-red-100 dark:border-red-950/40">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
