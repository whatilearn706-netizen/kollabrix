import { KA_CODEX_BOOKS, type CodingBook } from '@/data/kaCodexBooks';
import { KA_EXTENDED_BOOKS } from '@/data/kaExtendedBooks';
import {
  BOOK_CHAPTER_METAS,
  BOOK_MENTOR_GUIDES,
  CLASSIC_REAL_CHAPTER_LABELS,
} from '@/data/codexBookMeta';
import type { CodexBookVolume } from '@/data/codexCatalog';

const FOLIO_CATEGORY_STYLES: Record<string, { gradient: string; accent: string }> = {
  Systems: {
    gradient: 'from-[#101829] via-[#090D16] to-[#05070C]',
    accent: 'text-sky-300',
  },
  Algorithms: {
    gradient: 'from-[#141A24] via-[#0A0D14] to-[#05070B]',
    accent: 'text-slate-200',
  },
  Architecture: {
    gradient: 'from-[#12192A] via-[#080C15] to-[#05070C]',
    accent: 'text-indigo-300',
  },
  Craft: {
    gradient: 'from-[#181B24] via-[#0A0D14] to-[#05070B]',
    accent: 'text-zinc-200',
  },
  Interviews: {
    gradient: 'from-[#131C26] via-[#080C14] to-[#05070B]',
    accent: 'text-emerald-300',
  },
};

export const ALL_FOLIO_RAW_BOOKS: CodingBook[] = [
  ...KA_CODEX_BOOKS,
  ...KA_EXTENDED_BOOKS.map((entry) => entry.book),
];

const CLASSIC_VOLUMES: CodexBookVolume[] = KA_CODEX_BOOKS.map((b) => {
  const style = FOLIO_CATEGORY_STYLES[b.category] || FOLIO_CATEGORY_STYLES.Craft;
  const bookMetas = BOOK_CHAPTER_METAS[b.id] || [];
  const mentorGuide = BOOK_MENTOR_GUIDES[b.id];
  const realLabels = CLASSIC_REAL_CHAPTER_LABELS[b.id] || [];

  return {
    id: b.id,
    kind: 'book',
    title: b.title,
    languageTag: b.category,
    level: mentorGuide?.level,
    languageGroup: mentorGuide?.languageGroup,
    edition: `VOL. ${String(b.index).padStart(2, '0')} · ${b.year} · ${mentorGuide?.level?.toUpperCase() || 'CORE'}`,
    subtitle: b.tagline,
    spotlightAuthor: b.author,
    spotlightRole: `${mentorGuide?.languageGroup || b.category} · ${mentorGuide?.level || 'Core'} · ISBN ${b.isbn}`,
    spotlightBio: mentorGuide?.quickVerdict ? `${mentorGuide.quickVerdict} — ${b.tagline}` : b.tagline,
    ctaLabel: 'Open 80/20 Guide',
    pagesCount: b.pages,
    coverGradient: style.gradient,
    spineColor: b.spineColor,
    accentColor: style.accent,
    badgeText: (mentorGuide?.level || b.category).toUpperCase(),
    mentorGuide,
    chapters: b.chapters.map((ch, chIdx) => {
      const meta = bookMetas[chIdx] || bookMetas[0];
      return {
        id: `${b.id}-ch-${chIdx + 1}`,
        realChapterLabel: realLabels[chIdx] || `80/20 Core Extract ${chIdx + 1}`,
        title: ch.title,
        readTime: '6 min read',
        overview: ch.summary,
        keyRules: ch.takeaways,
        hackathonUse: meta?.hackathon,
        interviewFlashcards: meta?.flashcards,
        code:
          meta?.code ||
          (ch.codeSnippet
            ? {
                language: (ch.codeTitle?.toLowerCase().includes('cpp')
                  ? 'cpp'
                  : ch.codeTitle?.toLowerCase().includes('java')
                  ? 'java'
                  : 'python') as 'cpp' | 'java' | 'python',
                title: ch.codeTitle || `${ch.title} Implementation`,
                snippet: ch.codeSnippet,
              }
            : undefined),
      };
    }),
  };
});

const EXTENDED_VOLUMES: CodexBookVolume[] = KA_EXTENDED_BOOKS.map((entry) => {
  const b = entry.book;
  const style = FOLIO_CATEGORY_STYLES[b.category] || FOLIO_CATEGORY_STYLES.Craft;
  const mentorGuide = entry.mentor;

  return {
    id: b.id,
    kind: 'book',
    title: b.title,
    languageTag: b.category,
    level: mentorGuide.level,
    languageGroup: mentorGuide.languageGroup,
    edition: `VOL. ${String(b.index).padStart(2, '0')} · ${b.year} · ${mentorGuide.level.toUpperCase()}`,
    subtitle: b.tagline,
    spotlightAuthor: b.author,
    spotlightRole: `${mentorGuide.languageGroup} · ${mentorGuide.level} · ISBN ${b.isbn}`,
    spotlightBio: `${mentorGuide.quickVerdict} — ${b.tagline}`,
    ctaLabel: 'Open 80/20 Guide',
    pagesCount: b.pages,
    coverGradient: style.gradient,
    spineColor: b.spineColor,
    accentColor: style.accent,
    badgeText: mentorGuide.level.toUpperCase(),
    mentorGuide,
    chapters: b.chapters.map((ch, chIdx) => {
      const meta = entry.chapterMetas[chIdx] || entry.chapterMetas[0];
      return {
        id: `${b.id}-ch-${chIdx + 1}`,
        realChapterLabel: entry.realChapterLabels[chIdx] || `80/20 Essential Extract`,
        title: ch.title,
        readTime: '6 min read',
        overview: ch.summary,
        keyRules: ch.takeaways,
        hackathonUse: meta?.hackathon,
        interviewFlashcards: meta?.flashcards,
        code: meta?.code,
      };
    }),
  };
});

export const ALL_FOLIO_BOOK_VOLUMES: CodexBookVolume[] = [
  ...CLASSIC_VOLUMES,
  ...EXTENDED_VOLUMES,
];
