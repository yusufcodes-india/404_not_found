"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { ShieldAlert, UserCheck, Zap, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const adminStats = [
    { label: 'Pending KYC', value: '24', icon: <UserCheck size={20} /> },
    { label: 'Open Violations', value: '7', icon: <ShieldAlert size={20} /> },
    { label: 'Pending Chargers', value: '11', icon: <Zap size={20} /> },
    { label: 'Active Disputes', value: '3', icon: <AlertTriangle size={20} /> },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FileText size={18} /> },
    { id: 'kyc', label: 'KYC Records', icon: <UserCheck size={18} />, href: '/admin/kyc' },
    { id: 'violations', label: 'Violations', icon: <ShieldAlert size={18} />, href: '/admin/violations' },
    { id: 'chargers', label: 'Charger Review', icon: <Zap size={18} />, href: '/admin/chargers' },
    { id: 'audit', label: 'Audit Logs', icon: <FileText size={18} />, href: '/admin/audit' },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">ADMIN CONTROL CENTER</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">System Governance</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {adminStats.map(stat => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <Link
                key={tab.id}
                href={tab.href || '#'}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap',
                  activeTab === tab.id ? 'bg-kilari-primary text-white' : 'bg-white text-kilari-muted border border-kilari-card-border hover:bg-kilari-card'
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </Link>
            ))}
          </div>

          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-kilari-main">System Health</h3>
              <Badge variant="success">Operational</Badge>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Platform Revenue (MTD)', value: '₹1,24,500', status: 'up' },
                { label: 'Avg. Session kWh', value: '22.4 kWh', status: 'stable' },
                { label: 'Conversion Rate', value: '64%', status: 'up' },
                { label: 'Refund Rate', value: '1.2%', status: 'down' },
              ].map((metric, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-kilari-card rounded-2xl border border-kilari-card-border">
                  <span className="text-sm font-medium text-kilari-muted">{metric.label}</span>
                  <span className="font-bold text-kilari-main">{metric.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
