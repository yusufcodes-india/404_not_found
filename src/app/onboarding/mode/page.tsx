"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlugZap, Home } from 'lucide-react';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default function ModePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'renter' | 'host' | null>(null);

  const handleContinue = () => {
    if (!mode) return;
    // In real app: save mode to Supabase profile
    router.push('/onboarding/profile');
  };

  return (
    <OnboardingShell
      step={1}
      totalSteps={5}
      title="How will you use Kilari?"
      showBack={false}
      footerAction={
        <Button
          className="w-full h-14 rounded-full text-lg"
          disabled={!mode}
          onClick={handleContinue}
        >
          Continue
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-kilari-muted mb-4">
          Choose your primary role. You can switch any time. Many people do both.
        </p>

        <div className="grid gap-4">
          <div
            onClick={() => setMode('renter')}
            className={cn(
              'relative cursor-pointer p-6 rounded-[26px] border-2 transition-all flex items-center gap-4',
              mode === 'renter'
                ? 'border-kilari-primary bg-kilari-notice'
                : 'border-kilari-card-border bg-kilari-card hover:border-kilari-light-green'
            )}
          >
            <div className="w-14 h-14 bg-kilari-light-green rounded-2xl flex items-center justify-center text-kilari-primary">
              <PlugZap size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-kilari-main">Rent a Charger</h3>
              <p className="text-sm text-kilari-muted">Find and book a trusted charger near you.</p>
            </div>
            {mode === 'renter' && (
              <div className="w-6 h-6 bg-kilari-primary rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </div>
            )}
          </div>

          <div
            onClick={() => setMode('host')}
            className={cn(
              'relative cursor-pointer p-6 rounded-[26px] border-2 transition-all flex items-center gap-4',
              mode === 'host'
                ? 'border-kilari-primary bg-kilari-notice'
                : 'border-kilari-card-border bg-kilari-card hover:border-kilari-light-green'
            )}
          >
            <div className="w-14 h-14 bg-kilari-light-green rounded-2xl flex items-center justify-center text-kilari-primary">
              <Home size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-kilari-main">Lend a Charger</h3>
              <p className="text-sm text-kilari-muted">Earn from your idle charger, on your terms.</p>
            </div>
            {mode === 'host' && (
              <div className="w-6 h-6 bg-kilari-primary rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </div>
            )}
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
