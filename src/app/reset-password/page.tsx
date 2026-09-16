'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { providerApi } from '@/services/provider-api';
import { Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const tokenFromLink = params.get('token') || '';
  const [token, setToken] = useState(tokenFromLink);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await providerApi.resetPassword({ token, newPassword: password });
      if (!res.success) {
        setError(res.message || 'Could not reset password.');
        return;
      }
      setSuccess(res.message || 'Password updated. Sign in with the new password.');
      setTimeout(() => router.replace('/login'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0f1d] p-6 space-y-4">
        <h1 className="text-2xl font-black">Reset password</h1>
        <p className="text-xs text-slate-400">
          Use the token from your recovery email, or the OTP flow on the login screen.
        </p>
        {error ? <p className="text-xs text-rose-300">{error}</p> : null}
        {success ? <p className="text-xs text-emerald-300">{success}</p> : null}
        {!tokenFromLink ? (
          <div className="space-y-1.5">
            <Label>Reset token</Label>
            <Input value={token} onChange={(e) => setToken(e.target.value)} required className="h-11 rounded-2xl bg-slate-950" />
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label>New password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-2xl bg-slate-950" />
        </div>
        <div className="space-y-1.5">
          <Label>Confirm password</Label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="h-11 rounded-2xl bg-slate-950" />
        </div>
        <Button disabled={loading || !token} className="w-full h-11 rounded-2xl bg-teal-500 text-slate-950 font-black">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update password'}
        </Button>
        <Link href="/login" className="block text-center text-xs text-teal-400">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
