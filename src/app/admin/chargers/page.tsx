"use client";

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Zap, CheckCircle, XCircle } from 'lucide-react';

export default function ChargerReviewPage() {
  const pendingChargers = [
    { id: 'c1', name: 'Baner Elite Spot', host: 'Amit Sharma', power: '7.2kW', connector: 'Type 2', status: 'review' },
    { id: 'c2', name: 'Wakad Fast Charge', host: 'Priya Patil', power: '25kW', connector: 'CCS2', status: 'review' },
    { id: 'c3', name: 'Hinjawadi Hub', host: 'Suresh Iyer', power: '7.2kW', connector: 'Type 2', status: 'review' },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">ADMINISTRATION</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">Charger Approval</h1>
        </div>

        <div className="flex flex-col gap-4">
          {pendingChargers.map(charger => (
            <Card key={charger.id} padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-kilari-card-border rounded-full flex items-center justify-center text-kilari-muted">
                  <Zap size={24} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-kilari-main">{charger.name}</h3>
                    <Badge variant="warning">{charger.status}</Badge>
                  </div>
                  <p className="text-xs text-kilari-muted">
                    Host: {charger.host} • {charger.power} • {charger.connector}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" className="h-10 px-3 rounded-full text-xs" onClick={() => {}}>
                  <XCircle size={14} className="mr-1" /> Reject
                </Button>
                <Button className="h-10 px-3 rounded-full text-xs" onClick={() => {}}>
                  <CheckCircle size={14} className="mr-1" /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
