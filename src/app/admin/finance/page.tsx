"use client";

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Wallet, TrendingUp, Users, Percent } from 'lucide-react';

export default function FinancePage() {
  const metrics = [
    { label: 'Gross Merchandise Value', value: '₹1,24,500', icon: <Wallet size={20} />, trend: '+12%' },
    { label: 'Platform Revenue', value: '₹12,450', icon: <TrendingUp size={20} />, trend: '+8%' },
    { label: 'Active Users', value: '1,102', icon: <Users size={20} />, trend: '+22%' },
    { label: 'Conv. Rate', value: '64%', icon: <Percent size={20} />, trend: '+3%' },
  ];

  const recentSessions = [
    { id: 'S1', host: 'Amit Sharma', renter: 'Rahul Gupta', amount: '₹490', fee: '₹49', status: 'completed' },
    { id: 'S2', host: 'Priya Patil', renter: 'Sneha Kulkarni', amount: '₹1,200', fee: '₹120', status: 'completed' },
    { id: 'S3', host: 'Suresh Iyer', renter: 'Amit Sharma', amount: '₹310', fee: '₹31', status: 'disputed' },
    { id: 'S4', host: 'Amit Sharma', renter: 'Vikram Singh', amount: '₹840', fee: '₹84', status: 'completed' },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">FINANCE HUB</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">Revenue & Metrics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {metrics.map(m => (
            <Card key={m.label} padding="md" className="relative overflow-hidden">
              <div className="flex flex-col gap-1">
                <div className="text-kilari-primary mb-2">{m.icon}</div>
                <span className="text-xs font-bold text-kilari-muted uppercase tracking-wide">{m.label}</span>
                <span className="text-2xl font-black text-kilari-main">{m.value}</span>
                <span className="text-xs font-bold text-green-600">{m.trend} vs last month</span>
              </div>
            </Card>
          ))}
        </div>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-kilari-main">Recent Transactions</h3>
            <Button variant="ghost" className="text-xs">Export CSV</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-kilari-muted uppercase tracking-widest border-b border-kilari-card-border">
                <tr>
                  <th className="pb-3 pr-4">Session ID</th>
                  <th className="pb-3 pr-4">Host</th>
                  <th className="pb-3 pr-4">Renter</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Fee</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kilari-card-border">
                {recentSessions.map(s => (
                  <tr key={s.id} className="hover:bg-kilari-card transition-colors">
                    <td className="py-4 pr-4 text-sm font-medium text-kilari-main">{s.id}</td>
                    <td className="py-4 pr-4 text-sm text-kilari-muted">{s.host}</td>
                    <td className="py-4 pr-4 text-sm text-kilari-muted">{s.renter}</td>
                    <td className="py-4 pr-4 text-sm font-bold text-kilari-main">{s.amount}</td>
                    <td className="py-4 pr-4 text-sm text-kilari-primary font-bold">{s.fee}</td>
                    <td className="py-4">
                      <Badge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge>
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
