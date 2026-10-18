'use client';

import React from 'react';
import Link from 'next/link';
import { CustomSectionConfig } from '@/types/masterControl';
import { ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CustomAdminSpotlightSectionProps {
  config: CustomSectionConfig;
}

export function CustomAdminSpotlightSection({ config }: CustomAdminSpotlightSectionProps) {
  if (!config || !config.enabled) return null;

  const getThemeClasses = () => {
    switch (config.theme) {
      case 'gradient_blue':
        return 'bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 text-white border-blue-500/30';
      case 'gradient_emerald':
        return 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white border-emerald-500/30';
      case 'gradient_amber':
        return 'bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950 text-white border-amber-500/30';
      case 'clean_white':
        return 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-white/10 shadow-lg';
      case 'slate_dark':
        return 'bg-slate-900 text-white border-slate-800';
      case 'gradient_violet':
      default:
        return 'bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 text-white border-violet-500/30';
    }
  };

  const isLight = config.theme === 'clean_white';

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`p-8 sm:p-12 lg:p-14 rounded-3xl border ${getThemeClasses()} shadow-xl relative overflow-hidden`}
        >
          {/* Subtle Ambient Orb */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className={`space-y-5 ${config.bannerImageUrl ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl'}`}>
              {/* Badge */}
              {config.badge && (
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    isLight
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{config.badge}</span>
                </div>
              )}

              {/* Title */}
              <h2
                className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
                  isLight ? 'text-slate-900 dark:text-white' : 'text-white'
                }`}
              >
                {config.title}
              </h2>

              {/* Subtitle */}
              {config.subtitle && (
                <p
                  className={`text-sm sm:text-lg font-medium leading-relaxed ${
                    isLight ? 'text-slate-600 dark:text-slate-300' : 'text-slate-200'
                  }`}
                >
                  {config.subtitle}
                </p>
              )}

              {/* Content / Markdown description */}
              {config.content && (
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isLight ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300/90'
                  }`}
                >
                  {config.content}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {config.primaryButtonText && config.primaryButtonUrl && (
                  <Link href={config.primaryButtonUrl}>
                    <Button
                      variant="primary"
                      size="md"
                      className="font-bold px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-md border-0 transition-all active:scale-[0.98]"
                      rightIcon={<ArrowRight className="w-4 h-4 text-slate-900" />}
                    >
                      {config.primaryButtonText}
                    </Button>
                  </Link>
                )}

                {config.secondaryButtonText && config.secondaryButtonUrl && (
                  <Link href={config.secondaryButtonUrl}>
                    <Button
                      variant="outline"
                      size="md"
                      className={`font-bold px-6 py-3 rounded-2xl border transition-all active:scale-[0.98] ${
                        isLight
                          ? 'border-slate-300 text-slate-800 hover:bg-slate-100'
                          : 'border-white/20 text-white hover:bg-white/10'
                      }`}
                    >
                      {config.secondaryButtonText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Optional Banner Image */}
            {config.bannerImageUrl && (
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl max-h-80 w-full">
                  <img
                    src={config.bannerImageUrl}
                    alt={config.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
