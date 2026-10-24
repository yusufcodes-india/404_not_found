"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, MapPin, Calendar, ShieldAlert, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { AppShell } from '@/components/AppShell';
import { cn } from '@/lib/utils';

const CHARGER_TYPES = ['home', 'society', 'office', 'business', 'fleet'];
const CONNECTORS = ['Type 2', 'CCS2', 'Bharat AC-001', 'Bharat DC-001', '3-pin'];
const CURRENT_TYPES = ['AC', 'DC'];

export default function AddChargerWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'home',
    current: 'AC',
    powerKw: '',
    connector: '',
    parking: '',
    cableProvided: false,
    rules: '',
    lat: 18.5597,
    lng: 73.8100,
    address: '',
    slotType: 'both',
    days: [1, 2, 3, 4, 5],
    societyLoadLimit: '',
  });

  const updateForm = (data: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...data }));

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    // Simulation of server action
    console.log('Submitting charger:', formData);
    router.push('/host');
  };

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">LIST YOUR CHARGER</p>
            <h1 className="text-3xl font-extrabold text-kilari-main">Charger Details</h1>
          </div>
          <div className="text-sm font-bold text-kilari-muted">Step {step} of 4</div>
        </div>

        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={cn('h-1.5 flex-1 rounded-full transition-colors', s <= step ? 'bg-kilari-primary' : 'bg-kilari-card-border')} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="lg" className="flex flex-col gap-6">
              <Field
                label="Charger Name"
                placeholder="e.g. My Home Charger"
                value={formData.name}
                onChange={e => updateForm({ name: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => updateForm({ type: e.target.value as any })}
                    className="w-full h-14 px-4 rounded-2xl border-1.5 border-kilari-card-border outline-none focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20 bg-white text-kilari-main"
                  >
                    {CHARGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">Current</label>
                  <select
                    value={formData.current}
                    onChange={e => updateForm({ current: e.target.value as any })}
                    className="w-full h-14 px-4 rounded-2xl border-1.5 border-kilari-card-border outline-none focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20 bg-white text-kilari-main"
                  >
                    {CURRENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Power (kW)"
                  type="number"
                  placeholder="7.2"
                  value={formData.powerKw}
                  onChange={e => updateForm({ powerKw: e.target.value })}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">Connector</label>
                  <select
                    value={formData.connector}
                    onChange={e => updateForm({ connector: e.target.value })}
                    className="w-full h-14 px-4 rounded-2xl border-1.5 border-kilari-card-border outline-none focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20 bg-white text-kilari-main"
                  >
                    <option value="">Select</option>
                    {CONNECTORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <Field
                label="Parking Details"
                placeholder="e.g. Private driveway, Slot B2"
                value={formData.parking}
                onChange={e => updateForm({ parking: e.target.value })}
              />

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-kilari-card border border-kilari-card-border">
                <input
                  type="checkbox"
                  id="cable"
                  className="w-5 h-5 rounded border-kilari-card-border text-kilari-primary focus:ring-kilari-primary"
                  checked={formData.cableProvided}
                  onChange={e => updateForm({ cableProvided: e.target.checked })}
                />
                <label htmlFor="cable" className="text-sm font-medium text-kilari-main">Cable provided by host</label>
              </div>

              <Field
                label="Charging Rules"
                placeholder="e.g. No charging after 11 PM"
                value={formData.rules}
                onChange={e => updateForm({ rules: e.target.value })}
              />
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="lg" className="flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin size={20} className="text-kilari-primary" />
                <h3 className="font-bold text-kilari-main">Set Charger Location</h3>
              </div>

              <div className="aspect-video bg-kilari-card border-2 border-dashed border-kilari-card-border rounded-3xl flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-100 opacity-50" />
                <div className="relative z-10 flex flex-col items-center">
                  <MapPin size={40} className="text-kilari-primary mb-4 animate-bounce" />
                  <p className="font-bold text-kilari-main">Map Demo Mode</p>
                  <p className="text-sm text-kilari-muted max-w-xs">In real mode, you can drag the pin to your exact location.</p>
                </div>
              </div>

              <Field
                label="Exact Address"
                placeholder="Enter full address including society/house number"
                value={formData.address}
                onChange={e => updateForm({ address: e.target.value })}
              />
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="lg" className="flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={20} className="text-kilari-primary" />
                <h3 className="font-bold text-kilari-main">Availability Slots</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {['overnight', 'daytime', 'both'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateForm({ slotType: type })}
                    className={cn(
                      'p-4 rounded-2xl border-2 text-left transition-all capitalize',
                      formData.slotType === type ? 'border-kilari-primary bg-kilari-notice' : 'border-kilari-card-border bg-kilari-card'
                    )}
                  >
                    <span className="block font-bold text-kilari-main">{type}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = formData.days.includes(i)
                          ? formData.days.filter(d => d !== i)
                          : [...formData.days, i];
                        updateForm({ days: newDays });
                      }}
                      className={cn(
                        'px-4 py-2 rounded-full text-xs font-bold transition-all border',
                        formData.days.includes(i) ? 'bg-kilari-primary text-white border-kilari-primary' : 'bg-white text-kilari-muted border-kilari-card-border'
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="lg" className="flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <ShieldAlert size={20} className="text-kilari-primary" />
                <h3 className="font-bold text-kilari-main">Safety & Load Limits</h3>
              </div>

              <Field
                label="Society Load Limit (kW)"
                type="number"
                placeholder="e.g. 50"
                value={formData.societyLoadLimit}
                onChange={e => updateForm({ societyLoadLimit: e.target.value })}
                hint="The maximum combined power allowed by your society for EV charging."
              />

              <div className="p-4 bg-kilari-notice border border-kilari-notice-border rounded-2xl text-sm text-kilari-main leading-relaxed">
                <strong>Note:</strong> We use these limits to prevent grid overload. If you are a home user, you can leave this blank.
              </div>
            </Card>
          </div>
        )}

        <div className="flex gap-4 mt-10">
          {step > 1 && (
            <Button variant="ghost" className="flex-1 h-14 rounded-full" onClick={prevStep}>
              Back
            </Button>
          )}
          <Button
            className="flex-[2] h-14 rounded-full text-lg"
            disabled={step === 1 && (!formData.name || !formData.connector)}
            onClick={step === 4 ? handleSubmit : nextStep}
          >
            {step === 4 ? (
              <>
                <CheckCircle className="mr-2" size={20} />
                List Charger
              </>
            ) : 'Continue'}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
