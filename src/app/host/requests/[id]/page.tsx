"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Calendar, Zap, ShieldCheck } from 'lucide-react';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDecision = async (decision: 'approve' | 'decline') => {
    setLoading(true);
    // Simulation of server action
    await new Promise(res => setTimeout(res, 1000));
    console.log(`Booking ${params.id} ${decision}d`);
    router.push('/host');
  };

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">BOOKING REQUEST</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">Review Request</h1>
        </div>

        <Card padding="lg" className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-kilari-card-border rounded-full flex items-center justify-center text-kilari-muted">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-kilari-main">Rahul Gupta</h3>
              <div className="flex items-center gap-2">
                <Badge variant="success">KYC Verified</Badge>
                <span className="text-xs text-kilari-muted">• 12 completed sessions</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-kilari-primary mt-1" />
              <div>
                <span className="block text-xs font-bold text-kilari-muted uppercase tracking-wide">Requested Slot</span>
                <span className="text-kilari-main font-medium">Oct 26, 2026 • Overnight (8 PM - 8 AM)</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap size={20} className="text-kilari-primary mt-1" />
              <div>
                <span className="block text-xs font-bold text-kilari-muted uppercase tracking-wide">Vehicle</span>
                <span className="text-kilari-main font-medium">Tata Nexon EV • Type 2 Connector</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-kilari-primary mt-1" />
              <div>
                <span className="block text-xs font-bold text-kilari-muted uppercase tracking-wide">Estimated Energy</span>
                <span className="text-kilari-main font-medium">35 kWh • Est. ₹490</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="flex-1 h-14 rounded-full text-lg"
            onClick={() => handleDecision('decline')}
            disabled={loading}
          >
            Decline
          </Button>
          <Button
            className="flex-[2] h-14 rounded-full text-lg"
            onClick={() => handleDecision('approve')}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Approve Request'}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
