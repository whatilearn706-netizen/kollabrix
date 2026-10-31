'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadFileToStorage, UploadOptions } from '@/lib/supabase/storage';

export interface FileUploadProps {
  label?: string;
  helperText?: string;
  value?: string;
  onChange: (url: string) => void;
  options?: UploadOptions;
  className?: string;
  accept?: string;
  variant?: 'banner' | 'avatar' | 'square';
}

export function FileUpload({
  label = 'Upload Media Asset',
  helperText = 'PNG, JPG, WebP, or GIF up to 5MB',
  value,
  onChange,
  options,
  className = '',
  accept = 'image/*',
  variant = 'banner',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProcessFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadFileToStorage(file, options);
      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setUploadError(result.error || 'Failed to upload file.');
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload process failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        variant === 'avatar' ? (
          /* Avatar Preview State (Clean Circle) */
          <div className="flex items-center gap-4 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-800 border-2 border-amber-500/40 shrink-0 shadow-md">
              <img
                src={value}
                alt="Uploaded avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-colors shadow-xs"
                >
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs hover:bg-red-500/20 transition-colors"
                >
                  Remove
                </button>
              </div>
              <p className="text-[11px] text-slate-400">{helperText}</p>
            </div>
          </div>
        ) : (
          /* Default Banner Preview State */
          <div className="relative group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden p-2 transition-all">
            <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Uploaded preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold hover:bg-white transition-colors shadow-sm"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg bg-red-500/90 text-white hover:bg-red-600 transition-colors shadow-sm"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="pt-2 px-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Asset Ready</span>
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )
      ) : variant === 'avatar' ? (
        /* Avatar Dropzone Upload Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-4 flex items-center gap-4 transition-all ${
            isDragging
              ? 'border-amber-500 bg-amber-500/5 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:border-amber-500/40'
          }`}
        >
          {isUploading ? (
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 text-slate-400">
              <UploadCloud className="w-6 h-6 text-amber-400" />
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Click to upload photo
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging
              ? 'border-violet-500 bg-violet-500/5 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          {isUploading ? (
            <div className="py-4 space-y-2 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Processing file...</p>
              <p className="text-[11px] text-slate-400">Optimizing and storing asset</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to upload or drag &amp; drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
