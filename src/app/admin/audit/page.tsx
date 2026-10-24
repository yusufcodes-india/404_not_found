"use client";

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Search, Filter } from 'lucide-react';

export default function AuditLogsPage() {
  const logs = [
    { id: 'l1', actor: 'Admin', action: 'Approved KYC', entity: 'Rahul Gupta', timestamp: '2026-10-24 10:15', status: 'success' },
    { id: 'l2', actor: 'System', action: 'Payment Captured', entity: 'Booking #B-992', timestamp: '2026-10-24 11:30', status: 'success' },
    { id: 'l3', actor: 'Admin', action: 'Banned User', entity: 'Sneha Kulkarni', timestamp: '2026-10-24 12:05', status: 'warning' },
    { id: 'l4', actor: 'System', action: 'GatePass Generated', entity: 'Booking #B-101', timestamp: '2026-10-24 13:20', status: 'success' },
    { id: 'l5', actor: 'Guard', action: 'Scan Verified', entity: 'Booking #B-101', timestamp: '2026-10-24 14:00', status: 'success' },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">ADMINISTRATION</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">System Audit Log</h1>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-kilari-muted" />
            <input
              type="text"
              placeholder="Search actor, action, or entity..."
              className="w-full h-12 pl-10 pr-4 rounded-full bg-white border border-kilari-card-border outline-none focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20 text-sm"
            />
          </div>
          <Button variant="ghost" className="h-12 rounded-full px-4 flex items-center gap-2">
            <Filter size={18} /> Filter
          </Button>
        </div>

        <Card padding="lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-kilari-card-border text-xs font-bold text-kilari-muted uppercase tracking-widest">
                  <th className="pb-3 pr-4">Timestamp</th>
                  <th className="pb-3 pr-4">Actor</th>
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Entity</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kilari-card-border">
                {logs.map(log => (
                  <tr key={log.id} className="group hover:bg-kilari-card transition-colors">
                    <td className="py-4 pr-4 text-sm text-kilari-muted">{log.timestamp}</td>
                    <td className="py-4 pr-4 text-sm font-bold text-kilari-main">{log.actor}</td>
                    <td className="py-4 pr-4 text-sm text-kilari-main">{log.action}</td>
                    <td className="py-4 pr-4 text-sm text-kilari-muted">{log.entity}</td>
                    <td className="py-4">
                      <Badge variant={log.status === 'success' ? 'success' : 'warning'}>{log.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
