"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';
import { verifyOtp } from '@/app/api/auth/actions';

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleVerify = async (token: string) => {
    setOtp(token);
    setError(null);
    setLoading(true);

    try {
      // In a real app, we'd get the phone from the cookie on the server.
      // For demo, we'll use a placeholder.
      const result = await verifyOtp('9876543210', token);
      if (result.success) {
        router.push('/onboarding/mode');
      } else {
        setError(result.error || 'Verification failed.');
      }
    } catch (err) {
      setError('Couldn\'t reach Kilari. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kilari-bg flex items-center justify-center p-6">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="p-2 rounded-full"
            onClick={() => router.push('/login')}
          >
            <ArrowLeft size={24} />
          </Button>
          <div />
        </div>

        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-2">
            VERIFY YOUR NUMBER
          </p>
          <h1 className="text-4xl font-extrabold text-kilari-main tracking-tight mb-3">
            Enter the code.
          </h1>
          <p className="text-kilari-muted text-base">
            We sent a 6-digit code to <span className="text-kilari-main font-medium">+91 98765 ••••3</span>{' '}
            <button
              className="text-kilari-primary font-bold underline ml-1"
              onClick={() => router.push('/login')}
            >
              Change number
            </button>
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <OtpInput
            onComplete={handleVerify}
            error={!!error}
            disabled={loading}
          />

          {error && (
            <p className="text-sm text-red-600 text-center max-w-xs" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-sm text-kilari-muted">
              {!canResend ? (
                <span>Didn't get it? Resend code in {resendTimer}s</span>
              ) : (
                <span>Didn't get it?</span>
              )}
            </div>
            <Button
              variant="ghost"
              className="text-kilari-primary font-bold"
              disabled={!canResend || loading}
              onClick={() => {
                setResendTimer(30);
                setCanResend(false);
                // call sendOtp here
              }}
            >
              Resend code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
