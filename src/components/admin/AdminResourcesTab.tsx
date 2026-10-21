'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  Trash2,
  Edit2,
  ExternalLink,
  Play,
  Save,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Layers,
  HelpCircle,
  FileText,
  Code2,
  Lightbulb,
  ListVideo,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LanguageCurriculum, LearningStep, PracticeQuestion, TopicVideo, StudyMaterial } from '@/types/curriculum';
import { DEFAULT_CURRICULA } from '@/data/defaultCurriculum';

interface AdminResourcesTabProps {
  authToken?: string;
}

export function AdminResourcesTab({ authToken }: AdminResourcesTabProps) {
  const [curriculaMap, setCurriculaMap] = useState<Record<string, LanguageCurriculum>>(DEFAULT_CURRICULA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Curriculum & Step
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('java-beginner');
  const [selectedStepNumber, setSelectedStepNumber] = useState<number>(1);

  // Active sub-editor: 'videos' | 'practice' | 'study'
  const [activeSubEditor, setActiveSubEditor] = useState<'videos' | 'practice' | 'study'>('videos');

  // Video Modal state (Add / Edit)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Partial<TopicVideo> | null>(null);

  // Question Modal state (Add / Edit)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<PracticeQuestion> | null>(null);

  // Study Material form state
  const [studyOverview, setStudyOverview] = useState('');
  const [studyKeyPoints, setStudyKeyPoints] = useState<string[]>([]);
  const [newKeyPointText, setNewKeyPointText] = useState('');
  const [studyDocUrl, setStudyDocUrl] = useState('');

  // Fetch live curricula from API
  const fetchCurricula = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/curriculum');
      const data = await res.json();
      if (data.success && data.curricula && Object.keys(data.curricula).length > 0) {
        setCurriculaMap(data.curricula);
      }
    } catch (err) {
      console.warn('Failed to fetch curricula:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurricula();
  }, []);

  const currentCurriculum: LanguageCurriculum =
    curriculaMap[selectedCurriculumId] || curriculaMap['java-beginner'] || Object.values(curriculaMap)[0];

  const currentStep: LearningStep =
    currentCurriculum?.steps.find((s) => s.stepNumber === selectedStepNumber) || currentCurriculum?.steps[0];

  // Sync study material form fields when step changes
  useEffect(() => {
    if (currentStep) {
      setStudyOverview(currentStep.studyMaterial?.overview || '');
      setStudyKeyPoints(currentStep.studyMaterial?.keyPoints || []);
      setStudyDocUrl(currentStep.studyMaterial?.officialDocUrl || '');
    }
  }, [selectedCurriculumId, selectedStepNumber, currentStep]);

  // Extract YouTube ID from watch URL, short link, or raw ID
  const extractYouTubeId = (urlOrId: string): string => {
    if (!urlOrId) return '';
    const trimmed = urlOrId.trim();
    if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('?')) return trimmed;
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vMatch) return vMatch[1];
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    return trimmed;
  };

  // 1. SAVE / UPDATE VIDEO
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo?.title || !editingVideo?.videoUrl) {
      alert('Video title and URL/ID are required');
      return;
    }
    const ytId = extractYouTubeId(editingVideo.videoUrl || editingVideo.youtubeId || '');
    const videoPayload: TopicVideo = {
      id: editingVideo.id || `v-${Date.now()}`,
      title: editingVideo.title,
      instructor: editingVideo.instructor || 'Campus Mentor',
      duration: editingVideo.duration || '30m',
      videoUrl: editingVideo.videoUrl.startsWith('http')
        ? editingVideo.videoUrl
        : `https://www.youtube.com/watch?v=${ytId}`,
      youtubeId: ytId,
      notes: editingVideo.notes || '',
      type: editingVideo.type || 'Topic Lecture',
    };

    setIsSaving(true);
    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_video',
          curriculumId: currentCurriculum.id,
          stepNumber: currentStep.stepNumber,
          video: videoPayload,
        }),
      });
      const data = await res.json();
      if (data.success && data.curricula) {
        setCurriculaMap(data.curricula);
        setIsVideoModalOpen(false);
        setEditingVideo(null);
        setStatusMessage({ type: 'success', text: `Saved video "${videoPayload.title}" successfully!` });
      } else {
        alert(data.error || 'Failed to save video');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  // 2. DELETE VIDEO
  const handleDeleteVideo = async (videoId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete video "${title}"?`)) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_video',
          curriculumId: currentCurriculum.id,
          stepNumber: currentStep.stepNumber,
          videoId,
        }),
      });
      const data = await res.json();
      if (data.success && data.curricula) {
        setCurriculaMap(data.curricula);
        setStatusMessage({ type: 'success', text: `Deleted video "${title}" successfully!` });
      }
    } catch (err: any) {
      alert(err.message || 'Delete error');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. SAVE / UPDATE PRACTICE QUESTION
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion?.title || !editingQuestion?.description) {
      alert('Question title and problem statement are required');
      return;
    }
    const questionPayload: PracticeQuestion = {
      id: editingQuestion.id || `q-${Date.now()}`,
      title: editingQuestion.title,
      difficulty: editingQuestion.difficulty || 'Easy',
      description: editingQuestion.description,
      starterCode: editingQuestion.starterCode || currentStep.compilerStarterCode,
      expectedOutput: editingQuestion.expectedOutput || '',
      hints: typeof editingQuestion.hints === 'string'
        ? (editingQuestion.hints as string).split('\n').filter(Boolean)
        : editingQuestion.hints || [],
      stdin: editingQuestion.stdin || '',
    };

    setIsSaving(true);
    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_question',
          curriculumId: currentCurriculum.id,
          stepNumber: currentStep.stepNumber,
          question: questionPayload,
        }),
      });
      const data = await res.json();
      if (data.success && data.curricula) {
        setCurriculaMap(data.curricula);
        setIsQuestionModalOpen(false);
        setEditingQuestion(null);
        setStatusMessage({ type: 'success', text: `Saved question "${questionPayload.title}" successfully!` });
      } else {
        alert(data.error || 'Failed to save question');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. DELETE PRACTICE QUESTION
  const handleDeleteQuestion = async (questionId: string, title: string) => {
    if (!confirm(`Delete practice question "${title}"?`)) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_question',
          curriculumId: currentCurriculum.id,
          stepNumber: currentStep.stepNumber,
          questionId,
        }),
      });
      const data = await res.json();
      if (data.success && data.curricula) {
        setCurriculaMap(data.curricula);
        setStatusMessage({ type: 'success', text: `Deleted question "${title}" successfully!` });
      }
    } catch (err: any) {
      alert(err.message || 'Delete error');
    } finally {
      setIsSaving(false);
    }
  };

  // 5. SAVE STUDY MATERIAL
  const handleSaveStudyMaterial = async () => {
    setIsSaving(true);
    const updatedMaterial: StudyMaterial = {
      overview: studyOverview,
      keyPoints: studyKeyPoints,
      codeExamples: currentStep.studyMaterial?.codeExamples || [],
      cheatsheet: currentStep.studyMaterial?.cheatsheet || [],
      officialDocUrl: studyDocUrl,
    };

    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_study_material',
          curriculumId: currentCurriculum.id,
          stepNumber: currentStep.stepNumber,
          studyMaterial: updatedMaterial,
        }),
      });
      const data = await res.json();
      if (data.success && data.curricula) {
        setCurriculaMap(data.curricula);
        setStatusMessage({ type: 'success', text: `Saved study material for Step ${currentStep.stepNumber} successfully!` });
      } else {
        alert(data.error || 'Failed to save study material');
      }
    } catch (err: any) {
      alert(err.message || 'Save error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to verified defaults
  const handleResetDefaults = async () => {
    if (!confirm('Reset all curricula, steps, videos, and questions to original verified collegiate defaults?')) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_defaults' }),
      });
      const data = await res.json();
      if (data.success && data.curricula) {
        setCurriculaMap(data.curricula);
        setStatusMessage({ type: 'success', text: 'All curricula successfully restored to default!' });
      }
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    } finally {
      setIsSaving(false);
    }
  };

  const stepVideos: TopicVideo[] = (currentStep?.videos && currentStep.videos.length > 0)
    ? currentStep.videos
    : currentStep?.video
    ? [{ ...currentStep.video, id: currentStep.video.id || 'v-primary' }]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Reset */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>COLLEGIATE CURRICULUM & RESOURCES MANAGER</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Curriculum, Video Lectures & Practice Editor
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Add or delete video lectures, practice coding challenges, and collegiate study notes across all languages.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="text-xs border-slate-700 text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset to Curated Defaults
          </Button>
          <a
            href="/resources"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <span>Preview Live Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Language & Step Selectors */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-mono mb-1.5 block">Select Curriculum Course:</label>
            <select
              value={selectedCurriculumId}
              onChange={(e) => {
                setSelectedCurriculumId(e.target.value);
                setSelectedStepNumber(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.values(curriculaMap).map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.icon} {curr.title} ({curr.track.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono mb-1.5 block">Select Topic Step:</label>
            <select
              value={selectedStepNumber}
              onChange={(e) => setSelectedStepNumber(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {currentCurriculum.steps.map((st) => (
                <option key={st.stepNumber} value={st.stepNumber}>
                  Step {st.stepNumber}: {st.title} ({st.estimatedTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step Summary Banner */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-300">
          <span>Editing: <strong>Step {currentStep.stepNumber} — {currentStep.title}</strong></span>
          <span className="text-indigo-400">{currentCurriculum.compilerDisplayName}</span>
        </div>

        {/* Sub-Editor Tab Buttons: 🎥 Videos | ❓ Practice Questions | 📖 Study Material */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveSubEditor('videos')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeSubEditor === 'videos'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <ListVideo className="w-3.5 h-3.5" />
            <span>1. Video Lectures ({stepVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveSubEditor('practice')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeSubEditor === 'practice'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>2. Practice Questions ({currentStep.practiceQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubEditor('study')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeSubEditor === 'study'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Study Material Notes</span>
          </button>
        </div>
      </div>

      {/* PANEL 1: VIDEO LECTURES MANAGER */}
      {activeSubEditor === 'videos' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-rose-400" />
                Video Lectures for Step {currentStep.stepNumber}
              </h3>
              <p className="text-xs text-slate-400">
                You can add multiple videos for this topic. Students will see a playlist switcher on the side!
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingVideo({
                  id: `v-${Date.now()}`,
                  title: '',
                  instructor: '',
                  videoUrl: '',
                  duration: '30m',
                  notes: '',
                });
                setIsVideoModalOpen(true);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Another Video
            </Button>
          </div>

          <div className="space-y-3">
            {stepVideos.map((vid, idx) => (
              <div
                key={vid.id || idx}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{vid.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                      <span>Instructor: {vid.instructor}</span>
                      <span>• Duration: {vid.duration}</span>
                      <span>• YouTube ID: {vid.youtubeId}</span>
                    </div>
                    {vid.notes && <p className="text-xs text-slate-400 mt-1 italic">{vid.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={vid.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    title="Watch on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      setEditingVideo(vid);
                      setIsVideoModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-900 text-indigo-400 hover:text-indigo-300 border border-slate-800"
                    title="Edit Video"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(vid.id || `v-${idx}`, vid.title)}
                    className="p-2 rounded-lg bg-slate-900 text-rose-400 hover:text-rose-300 border border-slate-800"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PANEL 2: PRACTICE QUESTIONS MANAGER */}
      {activeSubEditor === 'practice' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Practice Questions for Step {currentStep.stepNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Challenges that test the student on this specific lecture topic.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingQuestion({
                  id: `q-${Date.now()}`,
                  title: '',
                  difficulty: 'Easy',
                  description: '',
                  starterCode: currentStep.compilerStarterCode,
                  expectedOutput: '',
                  hints: [],
                });
                setIsQuestionModalOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Practice Question
            </Button>
          </div>

          <div className="space-y-3">
            {currentStep.practiceQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {q.difficulty}
                    </span>
                    <h4 className="text-sm font-bold text-white">{q.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{q.description}</p>
                  <div className="text-xs text-slate-400 font-mono pt-1">
                    Expected: <code className="text-emerald-400">{q.expectedOutput}</code>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setIsQuestionModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-900 text-indigo-400 hover:text-indigo-300 border border-slate-800"
                    title="Edit Question"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id, q.title)}
                    className="p-2 rounded-lg bg-slate-900 text-rose-400 hover:text-rose-300 border border-slate-800"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PANEL 3: STUDY MATERIAL EDITOR */}
      {activeSubEditor === 'study' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Study Notes Editor for Step {currentStep.stepNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Update conceptual notes, takeaways, and official documentation links.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleSaveStudyMaterial}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              Save Study Notes
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1 block">Overview Paragraph:</label>
              <Textarea
                rows={3}
                value={studyOverview}
                onChange={(e) => setStudyOverview(e.target.value)}
                placeholder="Comprehensive concept explanation..."
                className="bg-slate-950 text-xs sm:text-sm text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono mb-1.5 block">Core Takeaways / Key Points:</label>
              <div className="space-y-2 mb-2">
                {studyKeyPoints.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-indigo-400 font-mono font-bold">{i + 1}.</span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => {
                        const next = [...studyKeyPoints];
                        next[i] = e.target.value;
                        setStudyKeyPoints(next);
                      }}
                      className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={() => setStudyKeyPoints(studyKeyPoints.filter((_, idx) => idx !== i))}
                      className="text-rose-400 hover:text-rose-300 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a new key takeaway point..."
                  value={newKeyPointText}
                  onChange={(e) => setNewKeyPointText(e.target.value)}
                  className="bg-slate-950 text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (newKeyPointText.trim()) {
                      setStudyKeyPoints([...studyKeyPoints, newKeyPointText.trim()]);
                      setNewKeyPointText('');
                    }
                  }}
                  className="text-xs shrink-0"
                >
                  Add Point
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono mb-1 block">Official Documentation URL:</label>
              <Input
                type="text"
                value={studyDocUrl}
                onChange={(e) => setStudyDocUrl(e.target.value)}
                placeholder="https://docs.oracle.com/en/java/..."
                className="bg-slate-950 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT VIDEO */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title={editingVideo?.id ? 'Edit Video Lecture' : 'Add New Video Lecture'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveVideo} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">Video Title:</label>
            <Input
              required
              value={editingVideo?.title || ''}
              onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
              placeholder="e.g. Java Classes and Objects Full Explanation"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">Instructor Name:</label>
              <Input
                value={editingVideo?.instructor || ''}
                onChange={(e) => setEditingVideo({ ...editingVideo, instructor: e.target.value })}
                placeholder="e.g. Bro Code, Kunal Kushwaha"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">Duration:</label>
              <Input
                value={editingVideo?.duration || ''}
                onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                placeholder="e.g. 45m"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">
              YouTube Video URL or 11-char ID:
            </label>
            <Input
              required
              value={editingVideo?.videoUrl || ''}
              onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=xk4_1vDrzzo"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">Instructor Notes / Timestamps:</label>
            <Textarea
              rows={2}
              value={editingVideo?.notes || ''}
              onChange={(e) => setEditingVideo({ ...editingVideo, notes: e.target.value })}
              placeholder="Focus on 15:00 to 45:00 for core memory layout..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsVideoModalOpen(false)} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} size="sm" className="bg-rose-600 hover:bg-rose-500">
              Save Video
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD / EDIT PRACTICE QUESTION */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestion?.id ? 'Edit Practice Question' : 'Add Practice Question'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 font-mono block mb-1">Question Title:</label>
              <Input
                required
                value={editingQuestion?.title || ''}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                placeholder="e.g. Find Max in Array"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">Difficulty:</label>
              <select
                value={editingQuestion?.difficulty || 'Easy'}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">Problem Description:</label>
            <Textarea
              required
              rows={3}
              value={editingQuestion?.description || ''}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, description: e.target.value })}
              placeholder="State the problem clearly, input format, output format..."
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">Expected Output String:</label>
            <Input
              required
              value={editingQuestion?.expectedOutput || ''}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, expectedOutput: e.target.value })}
              placeholder="e.g. Max Value = 99"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">Starter Code for Compiler:</label>
            <Textarea
              rows={4}
              value={editingQuestion?.starterCode || ''}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, starterCode: e.target.value })}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsQuestionModalOpen(false)} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} size="sm" className="bg-amber-600 hover:bg-amber-500">
              Save Practice Question
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
