'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export interface StreakHistoryEntry {
  date: string;
  category: string;
  note: string;
  xp: number;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  totalCheckIns: number;
  history: StreakHistoryEntry[];
}

export interface StreakActionResult {
  success: boolean;
  type: 'UNLOCKED_DAY_1' | 'INCREMENTED' | 'ALREADY_COMPLETED_TODAY' | 'RESTARTED';
  currentStreak: number;
  message: string;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Streak functionality has been fully disabled.
 * Stubbed out to prevent side-effects or UI popups.
 */
export async function recordDailyStreakActivity(options: {
  type: 'PROJECT_PUBLISHED' | 'WORKSPACE_ACTIVITY' | 'SPRINT_LOG';
  note: string;
  title?: string;
  userId?: string;
}): Promise<StreakActionResult> {
  return {
    success: true,
    type: 'INCREMENTED',
    currentStreak: 0,
    message: '',
  };
}

export function useDailyStreak() {
  return {
    streakState: {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
      totalCheckIns: 0,
      history: [],
    },
    isCheckedInToday: true,
    performCheckIn: async () => ({
      success: true,
      type: 'INCREMENTED' as const,
      currentStreak: 0,
      message: '',
    }),
  };
}

export function StreakNavbarButton({ onClick }: { onClick?: () => void }) {
  return null;
}

export function DailyStreakBanner({ onOpenCheckIn }: { onOpenCheckIn?: () => void }) {
  return null;
}

interface DailyStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyStreakModal({ isOpen, onClose }: DailyStreakModalProps) {
  return null;
}

export function StreakCelebrationToast() {
  return null;
}

export function DailyStreakAutoPrompt() {
  return null;
}
