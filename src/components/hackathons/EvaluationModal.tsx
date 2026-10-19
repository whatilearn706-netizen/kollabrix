'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  HackathonSubmission,
  HackathonJudgingCriteria,
  HackathonEvaluation,
} from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import {
  Award,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Github,
  Video,
  FileText,
} from 'lucide-react';
import { safeExternalUrl } from '@/lib/security/urlSanitizer';

interface EvaluationModalProps {
  hackathonId: string;
  submission: (HackathonSubmission & { team_name?: string }) | null;
  criteria: HackathonJudgingCriteria[];
  existingEvaluation?: HackathonEvaluation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (evaluation: HackathonEvaluation) => void;
}

export function EvaluationModal({
  hackathonId,
  submission,
  criteria,
  existingEvaluation,
  isOpen,
  onClose,
  onSuccess,
}: EvaluationModalProps) {
  const { user } = useAuth();

  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default criteria if none in DB
  const activeCriteria = criteria.length > 0
    ? criteria
    : [
        { id: 'c1', hackathon_id: hackathonId, name: 'Innovation & Originality', weight: 25, max_score: 10, created_at: '' },
        { id: 'c2', hackathon_id: hackathonId, name: 'Technical Execution & Architecture', weight: 25, max_score: 10, created_at: '' },
        { id: 'c3', hackathon_id: hackathonId, name: 'UI/UX Polish & Usability', weight: 20, max_score: 10, created_at: '' },
        { id: 'c4', hackathon_id: hackathonId, name: 'Problem Relevance & Impact', weight: 20, max_score: 10, created_at: '' },
        { id: 'c5', hackathon_id: hackathonId, name: 'Presentation & Documentation', weight: 10, max_score: 10, created_at: '' },
      ];

  useEffect(() => {
    if (existingEvaluation) {
      setScores(existingEvaluation.scores || {});
      setFeedback(existingEvaluation.feedback || '');
      setPrivateNotes(existingEvaluation.private_notes || '');
    } else {
      // Default initial score of 7 on all criteria
      const initial: Record<string, number> = {};
      activeCriteria.forEach((c) => {
        initial[c.id] = 7;
      });
      setScores(initial);
      setFeedback('');
      setPrivateNotes('');
    }
    setError(null);
  }, [existingEvaluation, submission]);

  if (!isOpen || !submission) return null;

  // Calculate weighted score (0 - 100)
  const totalWeight = activeCriteria.reduce((sum, c) => sum + (c.weight || 1), 0);
  const weightedSum = activeCriteria.reduce((sum, c) => {
    const rawScore = scores[c.id] ?? 0;
    const max = c.max_score || 10;
    const normalized = (rawScore / max) * (c.weight || 1);
    return sum + normalized;
  }, 0);

  const totalWeightedScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

  const handleScoreChange = (criteriaId: string, val: number) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in as a judge to evaluate submissions.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        hackathon_id: hackathonId,
        submission_id: submission.id,
        judge_id: user.id,
        scores,
        total_weighted_score: parseFloat(totalWeightedScore.toFixed(2)),
        feedback: feedback.trim() || null,
        private_notes: privateNotes.trim() || null,
      };

      if (isSupabaseConfigured()) {
        const { data, error: upsertError } = await supabase
          .from('hackathon_evaluations')
          .upsert(payload, { onConflict: 'submission_id,judge_id' })
          .select('*')
          .single();

        if (upsertError) {
          throw new Error(upsertError.message);
        }

        onSuccess(data as HackathonEvaluation);
      } else {
        const mock: HackathonEvaluation = {
          id: `eval-${Date.now()}`,
          hackathon_id: hackathonId,
          submission_id: submission.id,
          judge_id: user.id,
          scores,
          total_weighted_score: parseFloat(totalWeightedScore.toFixed(2)),
          feedback: feedback.trim() || undefined,
          private_notes: privateNotes.trim() || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onSuccess(mock);
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error recording evaluation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Judge Project Evaluation & Rubric Scoring"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 py-2">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Project Header Summary */}
        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-400 font-mono">
              Team: {submission.team_name || 'Hackathon Team'}
            </span>
            <span className="text-[11px] text-slate-400">
              Submitted: {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'Draft'}
            </span>
          </div>
          <h4 className="text-base font-bold text-white">{submission.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{submission.pitch}</p>

          {/* Deliverables quick links */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-charcoal-800">
            {submission.repository_url && (
              <a
                href={safeExternalUrl(submission.repository_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-charcoal-950 border border-charcoal-750 text-xs text-slate-300 hover:text-white"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Code Repo</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
            {submission.demo_url && (
              <a
                href={safeExternalUrl(submission.demo_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-500/15 border border-brand-500/30 text-xs text-brand-300 hover:text-brand-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </a>
            )}
            {submission.video_url && (
              <a
                href={safeExternalUrl(submission.video_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/15 border border-red-500/30 text-xs text-red-300 hover:text-red-200"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Demo</span>
              </a>
            )}
            {submission.documentation_url && (
              <a
                href={safeExternalUrl(submission.documentation_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300 hover:text-indigo-200"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Slides / Docs</span>
              </a>
            )}
          </div>
        </div>

        {/* Rubric Criteria Sliders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Rubric Criteria Scoring
            </h5>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Total Weighted Score:</span>
              <span className="text-lg font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 font-mono">
                {totalWeightedScore.toFixed(1)} / 100
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {activeCriteria.map((crit) => {
              const currentScore = scores[crit.id] ?? 7;
              const max = crit.max_score || 10;

              return (
                <div
                  key={crit.id}
                  className="p-3.5 rounded-xl bg-charcoal-900/60 border border-charcoal-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{crit.name}</span>
                      <span className="text-[11px] text-brand-400 ml-2 font-mono">
                        (Weight: {crit.weight}%)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white bg-charcoal-800 px-2 py-0.5 rounded border border-charcoal-700">
                      {currentScore} / {max}
                    </span>
                  </div>

                  {crit.description && (
                    <p className="text-[11px] text-slate-400">{crit.description}</p>
                  )}

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={max}
                      step={1}
                      value={currentScore}
                      onChange={(e) => handleScoreChange(crit.id, parseInt(e.target.value))}
                      className="flex-1 accent-brand-500 cursor-pointer h-1.5 bg-charcoal-700 rounded-lg"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Constructive Team Feedback */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Constructive Team Feedback (Visible to students after results published)
          </label>
          <Textarea
            rows={3}
            placeholder="Strengths observed, areas for improvement, and technical commendations..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        {/* Private Judge Notes */}
        <div>
          <label className="text-xs font-semibold text-amber-300 block mb-1">
            Private Jury Notes (Visible only to organizers and judges)
          </label>
          <Textarea
            rows={2}
            placeholder="Confidential remarks for award deliberation..."
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-charcoal-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Award className="w-4 h-4" />}
          >
            Save Evaluation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
