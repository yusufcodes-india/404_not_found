"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, XCircle, Clock, Zap, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function VerifyPage() {
  const params = useParams();
  const [result, setResult] = useState<{
    status: 'loading' | 'valid' | 'expired' | 'invalid';
    data?: any;
  }>({ status: 'loading' });

  useEffect(() => {
    const verify = async () => {
      const token = params.token as string;
      // In a real app, call a server action here
      // const res = await verifyGatePassAction(token);

      await new Promise(res => setTimeout(res, 1200)); // Simulate API delay

      if (token === 'expired-demo') {
        setResult({ status: 'expired' });
      } else if (token === 'invalid-demo') {
        setResult({ status: 'invalid' });
      } else {
        setResult({
          status: 'valid',
          data: {
            renter: 'Rahul Gupta',
            vehicle: 'Tata Nexon EV (MH 12 AB 1234)',
            charger: 'Baner Home Power',
            window: 'Oct 26, 8 PM - 8 AM',
          }
        });
      }
    };

    verify();
  }, [params.token]);

  if (result.status === 'loading') {
    return (
      <div className="min-h-screen bg-kilari-bg flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-kilari-card-border border-t-kilari-primary rounded-full animate-spin mb-4" />
        <p className="text-kilari-muted font-medium">Verifying Gate Pass...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kilari-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {result.status === 'valid' ? (
          <Card padding="lg" className="text-center border-kilari-primary ring-4 ring-kilari-primary/10">
            <div className="w-20 h-20 bg-kilari-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-kilari-main mb-2">Access Granted</h1>
            <p className="text-kilari-muted mb-8">The gate pass is valid. Please allow entry.</p>

            <div className="flex flex-col gap-4 text-left mb-8">
              <div className="flex items-center gap-3 p-4 bg-kilari-card rounded-2xl border border-kilari-card-border">
                <User size={20} className="text-kilari-primary" />
                <div>
                  <span className="block text-[10px] font-bold text-kilari-muted uppercase tracking-widest">Renter</span>
                  <span className="font-bold text-kilari-main">{result.data.renter}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-kilari-card rounded-2xl border border-kilari-card-border">
                <Zap size={20} className="text-kilari-primary" />
                <div>
                  <span className="block text-[10px] font-bold text-kilari-muted uppercase tracking-widest">Vehicle</span>
                  <span className="font-bold text-kilari-main">{result.data.vehicle}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-kilari-card rounded-2xl border border-kilari-card-border">
                <Clock size={20} className="text-kilari-primary" />
                <div>
                  <span className="block text-[10px] font-bold text-kilari-muted uppercase tracking-widest">Window</span>
                  <span className="font-bold text-kilari-main">{result.data.window}</span>
                </div>
              </div>
            </div>

            <Badge variant="success" className="px-4 py-1">VALIDATED ✓</Badge>
          </Card>
        ) : (
          <Card padding="lg" className="text-center border-red-500">
            <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <XCircle size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-kilari-main mb-2">
              {result.status === 'expired' ? 'Pass Expired' : 'Invalid Pass'}
            </h1>
            <p className="text-kilari-muted mb-8">
              {result.status === 'expired'
                ? 'This gate pass is no longer valid for the current time window.'
                : 'The provided QR code is invalid or has been tampered with.'}
            </p>
            <Badge variant="danger" className="px-4 py-1">DENIED</Badge>
          </Card>
        )}
      </div>
    </div>
  );
}
