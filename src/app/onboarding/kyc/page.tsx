"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';

export default function KycPage() {
  const router = useRouter();
  const [licence, setLicence] = useState('');
  const [dob, setDob] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async () => {
    setStatus('loading');

    // Mock delay
    await new Promise(res => setTimeout(res, 1500));

    if (licence === 'MH12000000000') {
      setStatus('error');
      setErrorMsg('We couldn\'t verify this licence. Check the number and try again.');
    } else if (licence.length < 10) {
      setStatus('error');
      setErrorMsg('Invalid licence number format.');
    } else {
      setStatus('success');
    }
  };

  return (
    <OnboardingShell
      step={5}
      totalSteps={5}
      title="Verify your licence"
      footerAction={
        <Button
          className="w-full h-14 rounded-full text-lg"
          disabled={status === 'loading' || !licence || !dob}
          onClick={handleVerify}
        >
          {status === 'loading' ? 'Connecting to DigiLocker...' : 'Verify with DigiLocker (demo)'}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-kilari-muted mb-2">
          This keeps hosts and drivers safe. It takes under a minute.
        </p>

        <Field
          label="Driving Licence Number"
          placeholder="e.g. MH12 20190012345"
          value={licence}
          onChange={(e) => setLicence(e.target.value)}
        />

        <Field
          label="Date of Birth"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />

        <Notice
          message="We don't store your Aadhaar or a copy of your licence. We keep only a verified flag and the last 4 characters."
        />

        {status === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm text-center font-medium">
            {errorMsg}
          </div>
        )}

        {status === 'success' && (
          <div className="p-6 bg-kilari-notice border border-kilari-notice-border rounded-3xl text-center">
            <div className="w-12 h-12 bg-kilari-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">✓</div>
            <h3 className="font-bold text-kilari-main text-lg mb-1">Verified ✓</h3>
            <p className="text-sm text-kilari-muted">Licence ending {licence.slice(-4)}</p>
            <Button
              className="mt-6 w-full h-12 rounded-full"
              onClick={() => router.push('/onboarding/done')}
            >
              Finish
            </Button>
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}

function useRouter() { return { push: (url: string) => window.location.href = url }; }
