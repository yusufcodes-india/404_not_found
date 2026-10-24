"use client";

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldAlert, UserX, CheckCircle, AlertCircle } from 'lucide-react';

export default function ViolationsPage() {
  const violations = [
    { id: 'v1', user: 'Sneha Kulkarni', type: 'phone', evidence: '+91 98765 43211', status: 'pending', severity: 'High' },
    { id: 'v2', user: 'Rahul Gupta', type: 'link', evidence: 'whatsapp.com/chat/...', status: 'confirmed', severity: 'Medium' },
    { id: 'v3', user: 'Amit Sharma', type: 'upi', evidence: 'amit@okaxis', status: 'dismissed', severity: 'Low' },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">ADMINISTRATION</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">Moderation Center</h1>
        </div>

        <div className="flex flex-col gap-4">
          {violations.map(v => (
            <Card key={v.id} padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                  <ShieldAlert size={24} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-kilari-main">{v.user}</h3>
                    <Badge variant={v.severity === 'High' ? 'danger' : 'warning'}>{v.severity}</Badge>
                  </div>
                  <p className="text-xs text-kilari-muted">
                    Type: <span className="font-medium text-kilari-main">{v.type}</span> •
                    Evidence: <span className="italic text-red-600">{v.evidence}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {v.status === 'pending' ? (
                  <>
                    <Button variant="ghost" className="h-10 px-3 rounded-full text-xs" onClick={() => {}}>
                      <CheckCircle size={14} className="mr-1" /> Dismiss
                    </Button>
                    <Button className="h-10 px-3 rounded-full text-xs bg-red-600 hover:bg-red-700" onClick={() => {}}>
                      <UserX size={14} className="mr-1" /> Ban User
                    </Button>
                  </>
                ) : (
                  <Badge variant={v.status === 'confirmed' ? 'danger' : 'default'}>
                    {v.status.toUpperCase()}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
