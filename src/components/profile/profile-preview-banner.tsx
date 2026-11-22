'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, Send, Clock, Loader2, CheckCircle2, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { canEditProfileAndDocuments, isProfileEditRequested } from '@/lib/profile-edit-lock';
import { useToast } from '@/hooks/use-toast';

export function ProfilePreviewBanner({
  contextLabel = 'profile details & documents',
}: {
  contextLabel?: string;
}) {
  const { user, updateUserData, refreshProfile } = useProviderAuth();
  const { toast } = useToast();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canEdit = canEditProfileAndDocuments(user);
  const requested = isProfileEditRequested(user);

  const handleRequestPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await providerApi.requestProfileEdit(
        reason.trim() || `Requesting Admin permission to update ${contextLabel}.`
      );
      if (!res.success) {
        throw new Error(res.message || 'Could not submit edit permission request.');
      }
      updateUserData({
        ...(res.result || {}),
        profileEditRequested: true,
        profileEditRequestReason:
          reason.trim() || `Requesting Admin permission to update ${contextLabel}.`,
      });
      setShowRequestForm(false);
      setReason('');
      toast({
        title: 'Permission request sent',
        description: 'AriesXpert Admin has been notified. Editing will unlock once approved.',
      });
      void refreshProfile().catch(() => {});
    } catch (err: any) {
      toast({
        title: 'Request could not be submitted',
        description: err?.message || 'Please contact clinical support at +91-9136447006.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (canEdit) {
    if (user?.profileEditAllowed) {
      return (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                Admin Edit Permission Active
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Admin has unlocked your {contextLabel} for editing and document uploads. Save your updates when ready.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0 self-start sm:self-center">
            <CheckCircle2 className="w-3.5 h-3.5" /> Editing Unlocked
          </span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                Preview Mode — Verified Profile Protected
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <ShieldCheck className="w-3 h-3" /> Read-Only
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Your {contextLabel} are locked in preview mode for credential security. Request Admin permission whenever you need to modify details or upload new documents.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {requested ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <Clock className="w-3.5 h-3.5" />
              Edit Permission Requested
            </span>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowRequestForm((v) => !v)}
              className="h-9 rounded-xl text-xs font-bold border-amber-500/40 bg-background/80 hover:bg-background"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Request Edit Permission
            </Button>
          )}
        </div>
      </div>

      {showRequestForm && !requested && (
        <form
          onSubmit={handleRequestPermission}
          className="pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2"
        >
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly state what you need to update (e.g., new bank account, updated degree certificate, service pincodes)…"
            className="h-10 rounded-xl text-xs bg-background flex-1"
          />
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowRequestForm(false)}
              className="h-10 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="h-10 px-4 rounded-xl text-xs font-bold gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{submitting ? 'Sending…' : 'Send to Admin'}</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
