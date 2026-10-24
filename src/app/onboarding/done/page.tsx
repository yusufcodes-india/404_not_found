"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Button } from '@/components/ui/Button';

export default function DonePage() {
  const router = useRouter();

  return (
    <OnboardingShell
      step={6}
      totalSteps={5} // Adjusted for the final state
      title="You're all set!"
      showBack={false}
      footerAction={
        <div className="flex flex-col gap-3">
          <Button
            className="w-full h-14 rounded-full text-lg"
            onClick={() => router.push('/map')}
          >
            Find your first charger
          </Button>
          <Button
            variant="ghost"
            className="w-full h-12 rounded-full"
            onClick={() => router.push('/host/chargers/new')}
          >
            List your first charger
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="w-24 h-24 bg-kilari-primary text-white rounded-full flex items-center justify-center mb-8 shadow-lg scale-110 transition-transform hover:scale-125">
          <span className="text-5xl font-bold">✓</span>
        </div>
        <h2 className="text-3xl font-extrabold text-kilari-main mb-4">Welcome to Kilari!</h2>
        <p className="text-kilari-muted max-w-xs mx-auto leading-relaxed">
          Your account is verified and ready to go. Start exploring community chargers in Pune.
        </p>
      </div>
    </OnboardingShell>
  );
}

function useRouter() { return { push: (url: string) => window.location.href = url }; }
