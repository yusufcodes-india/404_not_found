"use client";

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserCheck, XCircle, CheckCircle } from 'lucide-react';

export default function KycAdminPage() {
  const kycRequests = [
    { id: '1', name: 'Rahul Gupta', phone: '9876543210', licence: 'MH12 20190012345', dob: '1995-05-12', status: 'pending' },
    { id: '2', name: 'Sneha Kulkarni', phone: '9876543211', licence: 'MH12 20180054321', dob: '1992-11-20', status: 'pending' },
    { id: '3', name: 'Amit Sharma', phone: '9876543212', licence: 'MH12 20200098765', dob: '1988-02-15', status: 'verified' },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">ADMINISTRATION</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">KYC Verification</h1>
        </div>

        <div className="flex flex-col gap-4">
          {kycRequests.map(req => (
            <Card key={req.id} padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-kilari-card-border rounded-full flex items-center justify-center text-kilari-muted">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-kilari-main">{req.name}</h3>
                  <p className="text-xs text-kilari-muted">{req.phone} • {req.licence}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {req.status === 'verified' ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <>
                    <Button variant="ghost" className="h-10 px-3 rounded-full text-xs" onClick={() => {}}>
                      <XCircle size={14} className="mr-1" /> Reject
                    </Button>
                    <Button className="h-10 px-3 rounded-full text-xs" onClick={() => {}}>
                      <CheckCircle size={14} className="mr-1" /> Approve
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
