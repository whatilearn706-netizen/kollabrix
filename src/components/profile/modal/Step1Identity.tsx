'use client';

import React, { useRef, useState } from 'react';
import { Camera, User, AtSign, FileText, Loader2, Trash2 } from 'lucide-react';
import { uploadFileToStorage } from '@/lib/supabase/storage';

interface Step1IdentityProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  avatarUrl: string | null;
  setAvatarUrl: (val: string | null) => void;
  bio: string;
  setBio: (val: string) => void;
}

export function Step1Identity({
  displayName,
  setDisplayName,
  username,
  setUsername,
  avatarUrl,
  setAvatarUrl,
  bio,
  setBio,
}: Step1IdentityProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const res = await uploadFileToStorage(file, {
        bucket: 'platform-assets',
        folder: 'avatars',
        maxSizeMB: 5,
      });

      if (res.success && res.url) {
        setAvatarUrl(res.url);
      } else {
        setUploadError(res.error || 'Failed to upload photo.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Could not upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Avatar Picker & Header Section */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
        <div className="relative group shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 shadow-xl shadow-amber-500/20">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-amber-400 uppercase">
                  {(displayName || username || 'K').slice(0, 1)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Change photo"
            className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 border border-white/20 text-slate-200 hover:text-white hover:border-amber-400 transition-colors shadow-lg"
          >
            <Camera className="w-4 h-4 text-amber-400" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleAvatarFile}
          />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h4 className="text-sm font-bold text-white">Profile Photo & Identity</h4>
          <p className="text-xs text-slate-400">
            Choose a clear square photo. High-resolution photos increase campus project invites.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold hover:bg-amber-500/25 transition-all"
            >
              {avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>
          {uploadError && <p className="text-[11px] text-red-400 pt-1">{uploadError}</p>}
        </div>
      </div>

      {/* Name & Username Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Display Name <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Mayank Goyal"
              className="w-full h-11 px-3.5 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Unique Username <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="e.g. mayankgoyal"
              className="w-full h-11 px-3.5 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono transition-all"
            />
            <AtSign className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Unique handle for your public portfolio link
          </p>
        </div>
      </div>

      {/* Short Bio */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Short Bio</span>
          </label>
          <span className="text-[10px] font-mono text-slate-500">
            {bio.length}/200 chars
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={200}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="e.g. Passionate collegiate builder focusing on full-stack web and distributed systems. Excited to team up for hackathons!"
          className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none"
        />
      </div>
    </div>
  );
}
