"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

const VEHICLE_MODELS = [
  'Tata Nexon EV', 'Tata Tiago EV', 'Tata Punch EV', 'MG Comet EV',
  'MG ZS EV', 'Mahindra XUV400', 'Hyundai Kona', 'Ather 450X',
  'Ola S1 Pro', 'TVS iQube', 'Bajaj Chetak', 'Other'
];

const CONNECTORS = ['Type 2', 'CCS2', 'Bharat AC-001', 'Bharat DC-001', '3-pin'];

export default function VehiclePage() {
  const router = useRouter();
  const [type, setType] = useState('4-wheeler');
  const [model, setModel] = useState('');
  const [connector, setConnector] = useState('');
  const [capacity, setCapacity] = useState('');
  const [regNo, setRegNo] = useState('');

  const handleContinue = () => {
    router.push('/onboarding/consent');
  };

  const formatRegNo = (val: string) => {
    return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
  };

  return (
    <OnboardingShell
      step={3}
      totalSteps={5}
      title="Your Vehicle"
      footerAction={
        <div className="flex flex-col gap-3">
          <Button
            className="w-full h-14 rounded-full text-lg"
            disabled={!model || !connector || !regNo}
            onClick={handleContinue}
          >
            Continue
          </Button>
          <Button variant="ghost" className="w-full h-12 rounded-full" onClick={handleContinue}>
            Skip for now
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">
            Vehicle Type
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-kilari-card rounded-2xl border border-kilari-card-border">
            {['2-wheeler', '3-wheeler', '4-wheeler'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'py-2 text-xs font-bold rounded-xl transition-all',
                  type === t ? 'bg-kilari-primary text-white' : 'text-kilari-muted hover:bg-kilari-notice'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">
            Make & Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full h-14 px-4 rounded-2xl border-1.5 border-kilari-card-border outline-none transition-all focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20 bg-white text-kilari-main"
          >
            <option value="">Select model</option>
            {VEHICLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">
              Connector
            </label>
            <select
              value={connector}
              onChange={(e) => setConnector(e.target.value)}
              className="w-full h-14 px-4 rounded-2xl border-1.5 border-kilari-card-border outline-none transition-all focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20 bg-white text-kilari-main"
            >
              <option value="">Select</option>
              {CONNECTORS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field
            label="Capacity (kWh)"
            type="number"
            placeholder="e.g. 40"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        <Field
          label="Registration Number"
          placeholder="MH 12 AB 1234"
          value={regNo}
          onChange={(e) => setRegNo(formatRegNo(e.target.value))}
          hint="Enter your vehicle registration number"
        />
        <p className="text-xs text-kilari-muted italic">
          We don't verify your RC yet. Your details are only used to check charger compatibility.
        </p>
      </div>
    </OnboardingShell>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
