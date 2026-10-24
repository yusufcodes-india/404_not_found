"use client";

import React, { useState } from 'react';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function ConsentPage() {
  const router = useRouter();
  const [terms, setTerms] = useState(false);
  const [location, setLocation] = useState(false);

  const handleContinue = () => {
    if (!terms) return;
    router.push('/onboarding/kyc');
  };

  return (
    <OnboardingShell
      step={4}
      totalSteps={5}
      title="Permissions & Consent"
      footerAction={
        <Button
          className="w-full h-14 rounded-full text-lg"
          disabled={!terms}
          onClick={handleContinue}
        >
          Continue
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div
          onClick={() => setTerms(!terms)}
          className={cn(
            'p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between',
            terms ? 'border-kilari-primary bg-kilari-notice' : 'border-kilari-card-border bg-kilari-card'
          )}
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-kilari-main">Terms of Service & Privacy</h3>
            <p className="text-sm text-kilari-muted">I agree to the Kilari community guidelines and privacy policy.</p>
          </div>
          <div className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
            terms ? 'bg-kilari-primary border-kilari-primary text-white' : 'border-kilari-card-border'
          )}>
            {terms && <span className="text-xs font-bold">✓</span>}
          </div>
        </div>

        <div
          onClick={() => setLocation(!location)}
          className={cn(
            'p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between',
            location ? 'border-kilari-primary bg-kilari-notice' : 'border-kilari-card-border bg-kilari-card'
          )}
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-kilari-main">Location Access</h3>
            <p className="text-sm text-kilari-muted">Live location is only shared with your host while a paid booking is active.</p>
          </div>
          <div className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
            location ? 'bg-kilari-primary border-kilari-primary text-white' : 'border-kilari-card-border'
          )}>
            {location && <span className="text-xs font-bold">✓</span>}
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}

function useRouter() { return { push: (url: string) => window.location.href = url }; }
