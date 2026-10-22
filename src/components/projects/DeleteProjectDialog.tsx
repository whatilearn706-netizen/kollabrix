'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Trash2, AlertTriangle } from 'lucide-react';

export interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export function DeleteProjectDialog({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}: DeleteProjectDialogProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) {
      setError('You must be signed in to perform this action.');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      // Standard owner delete
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('owner_id', user.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      onClose();
      router.push('/explore');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Project Idea"
      description="This action cannot be undone."
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1">
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>
            Are you sure you want to permanently delete <strong>&ldquo;{projectTitle}&rdquo;</strong>? All project details will be removed across the platform.
          </span>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Project
          </Button>
        </div>
      </div>
    </Modal>
  );
}
