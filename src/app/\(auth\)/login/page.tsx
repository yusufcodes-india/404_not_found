"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { cn } from '@/lib/utils';
import { sendOtp } from '@/app/api/auth/actions';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await sendOtp(phone);
      if (result.success) {
        router.push('/login/verify');
      } else {
        setError(result.error || 'Something went wrong. Try again.');
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-kilari-light-green rounded-xl flex items-center justify-center">
            <Zap size={24} className="text-kilari-primary" />
          </div>
          <span className="text-2xl font-extrabold text-kilari-main">Kilari</span>
        </div>

        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-2">
            WELCOME TO KILARI
          </p>
          <h1 className="text-4xl font-extrabold text-kilari-main tracking-tight mb-3 leading-tight">
            Charge smarter, together.
          </h1>
          <p className="text-kilari-muted text-base leading-relaxed">
            Sign in with your phone number. We'll send a 6-digit code.
          </p>
        </div>

        <Card padding="lg" className="mb-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">
                Mobile number
              </label>
              <PhoneInput
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onValid={(val) => setError(null)}
                className={cn(error && 'border-red-500')}
              />
              {error && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1" role="alert">
                  <span className="font-bold">!</span> {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-full text-lg"
              isLoading={loading}
              disabled={!/^[6-9]\d{9}$/.test(phone)}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>

            <p className="text-center text-xs text-kilari-muted">
              By continuing you agree to our{' '}
              <a href="#" className="text-kilari-primary underline">Terms</a> and{' '}
              <a href="#" className="text-kilari-primary underline">Privacy Policy</a>.
            </p>
          </form>
        </Card>

        <Notice
          message="We only use your number to sign you in and to send booking updates. We never share it with other users."
          className="mb-6"
        />

        {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
          <div className="border-2 border-dashed border-kilari-card-border p-4 rounded-2xl text-center">
            <p className="text-xs text-kilari-muted">
              Demo mode: any valid number works. Use code <span className="font-bold text-kilari-main">123456</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
