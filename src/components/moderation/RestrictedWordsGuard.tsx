'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  DEFAULT_RESTRICTED_WORDS,
  checkRestrictedWords,
} from '@/lib/moderation/restrictedWords';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

interface RestrictedNotice {
  id: string;
  word: string;
  matchedWords: string[];
  timestamp: number;
}

interface RestrictedWordsContextType {
  words: string[];
  enabled: boolean;
  activeNotice: RestrictedNotice | null;
  dismissNotice: () => void;
  validateText: (text: string) => { hasRestricted: boolean; matchedWords: string[]; cleanText: string };
}

const RestrictedWordsContext = createContext<RestrictedWordsContextType>({
  words: DEFAULT_RESTRICTED_WORDS,
  enabled: true,
  activeNotice: null,
  dismissNotice: () => {},
  validateText: () => ({ hasRestricted: false, matchedWords: [], cleanText: '' }),
});

export function useRestrictedWords() {
  return useContext(RestrictedWordsContext);
}

export function RestrictedWordsGuard({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_restricted_words_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_RESTRICTED_WORDS;
  });

  const [enabled, setEnabled] = useState(true);
  const [activeNotice, setActiveNotice] = useState<RestrictedNotice | null>(null);
  const wordsRef = useRef<string[]>(words);
  const enabledRef = useRef<boolean>(enabled);
  const isSanitizingRef = useRef(false);
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Sync latest restricted words from API with real-time reactivity
  useEffect(() => {
    let cancelled = false;

    async function fetchWords() {
      try {
        const res = await fetch(`/api/restricted-words?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache' },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data && Array.isArray(data.words)) {
          setWords(data.words);
          setEnabled(data.enabled !== false);
          try {
            localStorage.setItem('linkora_restricted_words_v1', JSON.stringify(data.words));
          } catch (e) {}
        }
      } catch (err) {
        // Fallback to local defaults
      }
    }

    fetchWords();

    // Re-check on window focus (e.g. user switches tabs)
    const handleFocus = () => fetchWords();
    window.addEventListener('focus', handleFocus);

    // Cross-tab and same-tab instant sync event
    const handleCustomUpdate = (e: any) => {
      if (Array.isArray(e.detail)) {
        setWords(e.detail);
      } else {
        fetchWords();
      }
    };
    window.addEventListener('linkora-restricted-words-updated', handleCustomUpdate);

    // Storage event for other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'linkora_restricted_words_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setWords(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Periodic background sync every 60 seconds
    const intervalId = setInterval(fetchWords, 60000);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('linkora-restricted-words-updated', handleCustomUpdate);
      window.removeEventListener('storage', handleStorage);
      clearInterval(intervalId);
    };
  }, []);

  const triggerNotice = useCallback((matchedWords: string[], targetEl?: HTMLElement | null) => {
    if (matchedWords.length === 0) return;
    const wordDisplay = matchedWords.join(', ');

    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);

    setActiveNotice({
      id: String(Date.now()),
      word: wordDisplay,
      matchedWords,
      timestamp: Date.now(),
    });

    // Auto-dismiss after 4.5 seconds
    noticeTimerRef.current = setTimeout(() => {
      setActiveNotice(null);
    }, 4500);

    // Apply visual feedback ring to offending element
    if (targetEl) {
      targetEl.classList.add('ring-2', 'ring-red-500', 'bg-red-50/50');
      setTimeout(() => {
        targetEl.classList.remove('ring-2', 'ring-red-500', 'bg-red-50/50');
      }, 1200);
    }
  }, []);

  const dismissNotice = useCallback(() => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setActiveNotice(null);
  }, []);

  // Universal DOM Interceptor for all inputs, textareas, and contenteditable elements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleInput = (e: Event) => {
      if (isSanitizingRef.current || !enabledRef.current) return;
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInput = target instanceof HTMLInputElement;
      const isTextarea = target instanceof HTMLTextAreaElement;
      const isContentEditable = target.isContentEditable;

      if (!isInput && !isTextarea && !isContentEditable) return;

      // Skip password fields or non-text input types
      if (isInput) {
        const type = (target as HTMLInputElement).type?.toLowerCase();
        if (type === 'password' || type === 'file' || type === 'checkbox' || type === 'radio' || type === 'button' || type === 'submit') {
          return;
        }
      }

      let currentValue = '';
      if (isInput || isTextarea) {
        currentValue = (target as HTMLInputElement | HTMLTextAreaElement).value || '';
      } else if (isContentEditable) {
        currentValue = target.innerText || target.textContent || '';
      }

      if (!currentValue.trim()) return;

      const check = checkRestrictedWords(currentValue, wordsRef.current);
      if (check.hasRestricted) {
        isSanitizingRef.current = true;
        try {
          if (isInput || isTextarea) {
            const inputEl = target as HTMLInputElement | HTMLTextAreaElement;
            const cleanVal = check.cleanText;

            // Use native prototype setter so React state updates smoothly
            const proto = isTextarea
              ? window.HTMLTextAreaElement.prototype
              : window.HTMLInputElement.prototype;
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

            if (nativeSetter) {
              nativeSetter.call(inputEl, cleanVal);
            } else {
              inputEl.value = cleanVal;
            }

            // Dispatch synthetic input and change events for React
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (isContentEditable) {
            target.innerText = check.cleanText;
          }

          triggerNotice(check.matchedWords, target);
        } finally {
          isSanitizingRef.current = false;
        }
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!enabledRef.current) return;
      const pastedText = e.clipboardData?.getData('text') || '';
      if (!pastedText.trim()) return;

      const check = checkRestrictedWords(pastedText, wordsRef.current);
      if (check.hasRestricted) {
        e.preventDefault();
        const target = e.target as HTMLElement;

        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
          const inputEl = target;
          const start = inputEl.selectionStart || 0;
          const end = inputEl.selectionEnd || 0;
          const currentVal = inputEl.value || '';
          const cleanPaste = check.cleanText;

          const newVal = currentVal.substring(0, start) + cleanPaste + currentVal.substring(end);

          const proto = inputEl instanceof HTMLTextAreaElement
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;
          const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

          if (nativeSetter) {
            nativeSetter.call(inputEl, newVal);
          } else {
            inputEl.value = newVal;
          }

          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));

          // Set caret right after pasted text
          const newCursor = start + cleanPaste.length;
          inputEl.setSelectionRange(newCursor, newCursor);
        }

        triggerNotice(check.matchedWords, target);
      }
    };

    const handleSubmit = (e: SubmitEvent) => {
      if (!enabledRef.current) return;
      const form = e.target as HTMLFormElement;
      if (!form || !(form instanceof HTMLFormElement)) return;

      const elements = form.querySelectorAll('input, textarea');
      for (const el of Array.from(elements)) {
        const inp = el as HTMLInputElement | HTMLTextAreaElement;
        const type = (inp as HTMLInputElement).type?.toLowerCase();
        if (type === 'password' || type === 'file' || type === 'checkbox' || type === 'radio') continue;

        const val = inp.value || '';
        const check = checkRestrictedWords(val, wordsRef.current);
        if (check.hasRestricted) {
          e.preventDefault();
          e.stopPropagation();
          inp.focus();
          triggerNotice(check.matchedWords, inp);
          return false;
        }
      }
    };

    document.addEventListener('input', handleInput, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('submit', handleSubmit, true);

    return () => {
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, [triggerNotice]);

  const validateText = useCallback(
    (text: string) => checkRestrictedWords(text, wordsRef.current),
    []
  );

  return (
    <RestrictedWordsContext.Provider
      value={{
        words,
        enabled,
        activeNotice,
        dismissNotice,
        validateText,
      }}
    >
      {children}

      {/* Prominent High-Visibility Floating Alert Banner */}
      {activeNotice && (
        <aside
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] max-w-md w-[92vw] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="bg-red-950/95 text-white backdrop-blur-md border-2 border-red-500/80 rounded-2xl shadow-2xl p-4 flex items-start gap-3.5 ring-4 ring-red-500/20">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5 text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500 text-white font-mono">
                  Restricted Word
                </span>
                <span className="text-xs text-red-300 font-semibold">Not Allowed</span>
              </div>
              <p className="text-sm font-bold text-white mt-1 leading-snug">
                Cannot write restricted word:{' '}
                <span className="text-red-300 underline font-mono decoration-red-400 font-black">
                  &quot;{activeNotice.word}&quot;
                </span>
              </p>
              <p className="text-xs text-red-200/80 mt-1 leading-relaxed">
                This word is prohibited on Linkora. The restricted term has been blocked and removed.
              </p>
            </div>
            <button
              onClick={dismissNotice}
              aria-label="Dismiss restricted word notice"
              className="text-red-300 hover:text-white p-1 rounded-lg hover:bg-red-800/50 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
    </RestrictedWordsContext.Provider>
  );
}
