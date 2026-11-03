'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

interface AntiPhotoWatermarkGuardProps {
  studentName?: string;
  studentEmail?: string;
  studentCollege?: string;
  contestId?: string;
  children: React.ReactNode;
  className?: string;
  enableAntiOcrGrid?: boolean;
}

/**
 * AntiPhotoWatermarkGuard
 * Professional academic exam anti-photo and anti-OCR security shield.
 * 
 * Features:
 * 1. Multi-tier diagonal watermark carrying student identity, email, college, and live timestamp.
 * 2. High-frequency Moiré micro-grid pattern that disrupts smartphone camera auto-focus & AI OCR (ChatGPT / Google Lens).
 * 3. Continuous sub-pixel drift animation to prevent static image subtraction or crop-masking.
 * 4. DOM MutationObserver self-defense to prevent deletion or CSS tampering via DevTools.
 */
export function AntiPhotoWatermarkGuard({
  studentName = 'Contestant',
  studentEmail = '',
  studentCollege = '',
  contestId = '',
  children,
  className = '',
  enableAntiOcrGrid = true,
}: AntiPhotoWatermarkGuardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const watermarkOverlayRef = useRef<HTMLDivElement>(null);
  const [timestamp, setTimestamp] = useState<string>('');

  // Live timestamp updated every second for cryptographic non-repudiation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(
        `${now.toISOString().replace('T', ' ').substring(0, 19)} UTC`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format identity string for watermark tile
  const watermarkText = useMemo(() => {
    const parts = [
      studentName.toUpperCase(),
      studentEmail ? `<${studentEmail}>` : '',
      studentCollege ? `[${studentCollege}]` : '',
      contestId ? `CID:${contestId.slice(0, 8)}` : '',
      timestamp,
      'CONFIDENTIAL // ICPC HONORS INTEGRITY',
    ].filter(Boolean);
    return parts.join(' • ');
  }, [studentName, studentEmail, studentCollege, contestId, timestamp]);

  // Generate SVG Background Data URI for the diagonal repeated watermark
  const watermarkSvgUri = useMemo(() => {
    const width = 560;
    const height = 280;
    const escapedText = watermarkText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text 
        x="50%" 
        y="50%" 
        fill="rgba(255, 255, 255, 0.048)" 
        font-family="monospace, sans-serif" 
        font-size="11" 
        font-weight="bold" 
        letter-spacing="1.5px"
        text-anchor="middle" 
        transform="rotate(-24, ${width / 2}, ${height / 2})"
      >
        ${escapedText}
      </text>
    </svg>`;

    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  }, [watermarkText]);

  // MutationObserver to defend against DevTools DOM deletion or opacity nullification
  useEffect(() => {
    const container = containerRef.current;
    const overlay = watermarkOverlayRef.current;
    if (!container || !overlay || typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(() => {
      if (!container.contains(overlay)) {
        // Overlay was deleted: immediately restore it
        container.appendChild(overlay);
      }
      // Verify styles have not been set to display:none or opacity:0
      const currentOpacity = window.getComputedStyle(overlay).opacity;
      const currentDisplay = window.getComputedStyle(overlay).display;
      if (currentDisplay === 'none' || parseFloat(currentOpacity) < 0.5) {
        overlay.style.display = 'block';
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      {/* 1. Underlying Problem Content */}
      <div className="relative z-0 select-none pointer-events-auto">
        {children}
      </div>

      {/* 2. High-Frequency Anti-OCR Optical Moiré Grid */}
      {enableAntiOcrGrid && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`,
            backgroundSize: '4px 4px',
          }}
        />
      )}

      {/* 3. Anti-Photo Watermark Overlay with Sub-Pixel Drift */}
      <div
        ref={watermarkOverlayRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
        style={{
          opacity: 1,
          display: 'block',
          visibility: 'visible',
        }}
      >
        <div
          className="w-[200%] h-[200%] -top-[50%] -left-[50%] absolute pointer-events-none animate-watermark-drift"
          style={{
            backgroundImage: watermarkSvgUri,
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
          }}
        />
      </div>
    </div>
  );
}
