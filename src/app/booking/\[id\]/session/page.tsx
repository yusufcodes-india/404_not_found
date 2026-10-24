"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Zap, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getMeterAdapter } from '@/lib/adapters/meter';
import { calcSession } from '@/lib/pricing';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'ready' | 'active' | 'ending' | 'completed'>('ready');
  const [meterData, setMeterData] = useState<{ start: number; end?: number; kwh?: number; cost?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const meter = getMeterAdapter();

  const startSession = async () => {
    setError(null);
    try {
      const startReading = await meter.readStart(params.id as string);
      setMeterData({ start: startReading });
      setStatus('active');
      // In real app: update booking status to 'active' via server action
    } catch (err) {
      setError('Failed to start session. Please check the charger connection.');
    }
  };

  const endSession = async () => {
    setStatus('ending');
    try {
      const endReading = await meter.readEnd(params.id as string);
      const kwh = endReading - (meterData?.start || 0);
      const pricing = calcSession(kwh);

      setMeterData(prev => ({
        ...prev!,
        end: endReading,
        kwh: kwh,
        cost: pricing.gross / 100, // convert paise to rupees
      }));
      setStatus('completed');
      // In real app: update booking status to 'completed' and save to 'sessions_meter'
    } catch (err) {
      setError('Failed to end session. Please contact the host.');
      setStatus('active');
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-md mx-auto pb-32">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">LIVE SESSION</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">Charging...</h1>
        </div>

        <div className="flex justify-center mb-10">
          <div className={cn(
            'w-48 h-48 rounded-full border-8 flex flex-col items-center justify-center transition-all duration-500',
            status === 'active' ? 'border-kilari-primary shadow-[0_0_30px_rgba(75,122,63,0.3)]' : 'border-kilari-card-border'
          )}>
            {status === 'active' ? (
              <>
                <Zap size={48} className="text-kilari-primary animate-pulse mb-2" />
                <span className="text-2xl font-black text-kilari-main">ACTIVE</span>
              </>
            ) : status === 'completed' ? (
              <>
                <CheckCircle size={48} className="text-green-500 mb-2" />
                <span className="text-2xl font-black text-kilari-main">DONE</span>
              </>
            ) : (
              <>
                <Clock size={48} className="text-kilari-muted mb-2" />
                <span className="text-2xl font-black text-kilari-muted">READY</span>
              </>
            )}
          </div>
        </div>

        <Card padding="lg" className="mb-8 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-kilari-muted">Start Reading</span>
            <span className="font-bold text-kilari-main">{meterData?.start || '---'} kWh</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-kilari-muted">End Reading</span>
            <span className="font-bold text-kilari-main">{meterData?.end || '---'} kWh</span>
          </div>
          <div className="pt-4 border-t border-kilari-card-border flex justify-between items-center">
            <span className="text-base font-bold text-kilari-main">Total Energy</span>
            <span className="text-xl font-black text-kilari-primary">{meterData?.kwh?.toFixed(2) || '0.00'} kWh</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-kilari-main">Final Cost</span>
            <span className="text-xl font-black text-kilari-main">₹{meterData?.cost?.toFixed(2) || '0.00'}</span>
          </div>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm text-center mb-6 flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {status === 'ready' && (
          <Button className="w-full h-16 rounded-full text-xl shadow-lg" onClick={startSession}>
            Start Charging
          </Button>
        )}

        {status === 'active' && (
          <Button className="w-full h-16 rounded-full text-xl bg-red-600 hover:bg-red-700 text-white" onClick={endSession}>
            Stop & Finish
          </Button>
        )}

        {status === 'completed' && (
          <Button className="w-full h-16 rounded-full text-xl" onClick={() => router.push('/booking/feedback')}>
            Leave Feedback
          </Button>
        )}
      </div>
    </AppShell>
  );
}

function cn(...inputs: any[]) { return inputs.filter(Boolean).join(' '); }
