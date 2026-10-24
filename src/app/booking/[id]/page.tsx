"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, CheckCircle, Lock, CreditCard, QrCode, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BookingDetailPage() {
  const params = useParams();
  // Mock status - this comes from DB
  const status: 'requested' | 'approved' | 'paid' | 'active' | 'completed' = 'requested';

  const steps = [
    { id: 'requested', label: 'Request', icon: Clock },
    { id: 'approved', label: 'Approval', icon: CheckCircle },
    { id: 'paid', label: 'Payment', icon: CreditCard },
    { id: 'pass', label: 'Gate pass', icon: QrCode },
    { id: 'charging', label: 'Charging', icon: Zap },
    { id: 'feedback', label: 'Feedback', icon: CheckCircle },
  ];

  const getStepStatus = (stepId: string) => {
    if (status === 'requested') return stepId === 'requested' ? 'active' : 'pending';
    if (status === 'approved') return stepId === 'requested' ? 'completed' : (stepId === 'approved' ? 'active' : 'pending');
    if (status === 'paid') return stepId === 'feedback' ? 'pending' : 'completed';
    // etc...
    return 'pending';
  };

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto pb-32">
        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">BOOKING DETAILS</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">My Session</h1>
        </div>

        {/* 6-Step Stepper */}
        <div className="flex justify-between items-start mb-12 relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-kilari-card-border -z-10" />
          {steps.map((step, i) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 w-14">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all border-2',
                  status === 'completed' ? 'bg-kilari-primary border-kilari-primary text-white' :
                  status === 'active' ? 'bg-white border-kilari-primary text-kilari-primary ring-4 ring-kilari-primary/20' :
                  'bg-white border-kilari-card-border text-kilari-muted'
                )}>
                  {status === 'completed' ? <CheckCircle size={20} /> : <step.icon size={20} />}
                </div>
                <span className={cn(
                  'text-[10px] font-bold uppercase tracking-tighter text-center',
                  status === 'active' ? 'text-kilari-primary' : 'text-kilari-muted'
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <Card padding="lg" className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-kilari-main text-lg">Booking Summary</h3>
            <Badge variant={status === 'requested' ? 'warning' : 'success'}>
              {status.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-kilari-muted">Charger</span>
              <span className="font-bold text-kilari-main">Baner Home Power</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-kilari-muted">Date & Time</span>
              <span className="font-bold text-kilari-main">Oct 26, 8 PM - 8 AM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-kilari-muted">Estimated Cost</span>
              <span className="font-bold text-kilari-main">₹490</span>
            </div>
          </div>
        </Card>

        {/* Conditional Action Area */}
        <div className="flex flex-col gap-4">
          {status === 'requested' && (
            <div className="p-6 bg-white rounded-3xl border border-kilari-card-border text-center">
              <div className="flex items-center justify-center gap-2 mb-2 text-kilari-primary font-bold">
                <Clock size={20} />
                Waiting for Approval
              </div>
              <p className="text-sm text-kilari-muted">
                The host has been notified. We'll alert you as soon as they approve your request.
              </p>
            </div>
          )}

          {status === 'approved' && (
            <div className="flex flex-col gap-4">
              <div className="p-6 bg-white rounded-3xl border border-kilari-card-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-kilari-primary" />
                  <div className="text-left">
                    <span className="block font-bold text-kilari-main">Payment Required</span>
                    <span className="text-xs text-kilari-muted">Amount: ₹490</span>
                  </div>
                </div>
                <Button className="rounded-full h-10 px-6" onClick={() => {}}>
                  Pay Now
                </Button>
              </div>
            </div>
          )}

          {status === 'paid' && (
            <Button
              className="w-full h-14 rounded-full text-lg"
              onClick={() => {}}
            >
              View Gate Pass
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
