"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [city, setCity] = useState('Pune');

  const handleContinue = () => {
    if (name.length < 2) return;
    // save to Supabase
    router.push('/onboarding/vehicle');
  };

  return (
    <OnboardingShell
      step={2}
      totalSteps={5}
      title="Tell us about yourself"
      footerAction={
        <Button
          className="w-full h-14 rounded-full text-lg"
          disabled={name.length < 2}
          onClick={handleContinue}
        >
          Continue
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Field
          label="Full Name"
          placeholder="e.g. Yusuf Tarwala"
          value={name}
          onChange={(e) => setName(e.target.value)}
          hint="Enter your full name as per your ID"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">
            City
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full h-14 px-4 rounded-2xl border-1.5 border-kilari-card-border outline-none transition-all focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20 bg-white text-kilari-main"
          >
            <option value="Pune">Pune</option>
            <option value="Mumbai" disabled>Mumbai (Coming soon)</option>
            <option value="Bangalore" disabled>Bangalore (Coming soon)</option>
          </select>
        </div>
      </div>
    </OnboardingShell>
  );
}
