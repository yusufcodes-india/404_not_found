"use client";

import React from 'react';
import Link from 'next/link';
import { Map as MapIcon, Plus, Zap, Calendar, Star, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Notice } from '@/components/ui/Notice';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppShell } from '@/components/AppShell';

export default function HostDashboard() {
  // Mock stats - these will come from DB in later steps
  const stats = [
    { label: 'Requests', value: '12', icon: <Calendar size={20} /> },
    { label: 'Active sessions', value: '3', icon: <Zap size={20} /> },
    { label: 'Earnings', value: '₹4,250', icon: <Wallet size={20} /> },
    { label: 'Rating', value: '4.8', icon: <Star size={20} /> },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">
              HOST DASHBOARD
            </p>
            <h1 className="text-3xl font-extrabold text-kilari-main">Your charging space.</h1>
            <p className="text-kilari-muted text-sm mt-1">
              Manage only your demo listings, requests, sessions and earnings.
            </p>
          </div>
          <Link
            href="/map"
            className="w-12 h-12 bg-kilari-light-green rounded-2xl flex items-center justify-center text-kilari-primary shadow-sm hover:scale-105 transition-transform"
            title="Switch to Rent mode"
          >
            <MapIcon size={24} />
          </Link>
        </div>

        <Notice
          message="Host actions are stored locally on this device. No real payment or payout is processed."
          className="mb-8"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>

        <Button
          className="w-full h-14 rounded-full text-lg mb-10"
          onClick={() => {}} // Link to /host/chargers/new
        >
          <Plus className="mr-2" size={20} />
          Add another charger
        </Button>

        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-extrabold text-kilari-main">Incoming requests</h3>
          <EmptyState
            title="No incoming requests"
            description="Requests for your own active chargers will appear here."
            icon={<Calendar size={40} className="text-kilari-muted" />}
          />
        </div>
      </div>
    </AppShell>
  );
}
