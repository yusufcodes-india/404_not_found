"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Notice } from '@/components/ui/Notice';
import { Zap, MapPin, ShieldCheck, Clock, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChargerDetailPage() {
  const params = useParams();
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Mock charger data
  const charger = {
    id: params.id,
    name: 'Baner Home Power',
    type: 'home',
    power: '7.2kW',
    connector: 'Type 2',
    price: '₹14/kWh',
    rules: 'Please park inside the gate. Do not block the driveway.',
    approxArea: 'Baner, Pune',
    score: 87,
    breakdown: {
      rating: 4.6,
      condition: 92,
      ownerReliability: 88,
      easeOfTravel: 81,
    },
    recommendations: [
      'Highly rated by local community',
      'Consistent power delivery',
      'Easy access from Main Road',
      'Verified Host',
    ],
    nearby: [
      { name: 'Cafe Coffee Day', dist: '200m', type: 'Cafe', rating: 4.1 },
      { name: 'The Orchid', dist: '500m', type: 'Restaurant', rating: 4.5 },
    ],
  };

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto pb-32">
        {/* Hero Image / Header */}
        <div className="relative h-64 bg-kilari-card rounded-[32px] overflow-hidden mb-8">
          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-kilari-muted">
            [Charger Photos Gallery]
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <Badge variant="success" className="mb-2">Verified Charger</Badge>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-md">{charger.name}</h1>
          </div>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-kilari-card-border text-center">
            <Zap size={20} className="mx-auto mb-1 text-kilari-primary" />
            <span className="block text-xs text-kilari-muted uppercase font-bold">Power</span>
            <span className="font-bold text-kilari-main">{charger.power}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-kilari-card-border text-center">
            <ShieldCheck size={20} className="mx-auto mb-1 text-kilari-primary" />
            <span className="block text-xs text-kilari-muted uppercase font-bold">Connector</span>
            <span className="font-bold text-kilari-main">{charger.connector}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-kilari-card-border text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-kilari-primary">
              <Star size={16} className="fill-current" />
              <span className="text-xs font-bold">4.6</span>
            </div>
            <span className="block text-xs text-kilari-muted uppercase font-bold">Rating</span>
            <span className="font-bold text-kilari-main">Top Rated</span>
          </div>
        </div>

        {/* Kilari Score Block */}
        <Card padding="lg" className="mb-8 bg-kilari-notice border-kilari-notice-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-kilari-main">Kilari Score</h3>
              <p className="text-sm text-kilari-muted">Our AI trust & reliability metric</p>
            </div>
            <div className="text-4xl font-black text-kilari-primary">{charger.score}</div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
            {Object.entries(charger.breakdown).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs font-medium text-kilari-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold text-kilari-main">{val}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-3">Why recommended</p>
            {charger.recommendations.map((rec, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-kilari-main">
                <div className="w-1.5 h-1.5 rounded-full bg-kilari-primary" />
                {rec}
              </div>
            ))}
          </div>
        </Card>

        {/* Rules & Location */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-kilari-card-border">
            <div className="flex items-center gap-2 mb-3 text-kilari-main font-bold">
              <ShieldCheck size={20} className="text-kilari-primary" />
              Charging Rules
            </div>
            <p className="text-sm text-kilari-muted leading-relaxed">{charger.rules}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-kilari-card-border">
            <div className="flex items-center gap-2 mb-3 text-kilari-main font-bold">
              <MapPin size={20} className="text-kilari-primary" />
              Location
            </div>
            <p className="text-sm text-kilari-muted mb-4">Approximate location: {charger.approxArea}</p>
            <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-kilari-muted italic">
              Approximate map view
            </div>
            <Notice
              message="Exact address and live location stay hidden until your booking is approved and paid."
              className="mt-4"
            />
          </div>
        </div>

        {/* Nearby */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-kilari-main font-bold">
            <Utensils size={20} className="text-kilari-primary" />
            Nearby while you charge
          </div>
          <div className="grid grid-cols-1 gap-3">
            {charger.nearby.map((place, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-kilari-card-border">
                <div>
                  <h4 className="font-bold text-kilari-main text-sm">{place.name}</h4>
                  <p className="text-xs text-kilari-muted">{place.type} • {place.dist}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-kilari-main">
                  <Star size={12} className="fill-yellow-500 text-yellow-500" />
                  {place.rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Section */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-kilari-bg via-kilari-bg to-transparent">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="flex-1 bg-white p-3 rounded-2xl border border-kilari-card-border flex items-center gap-3">
              <Clock size={20} className="text-kilari-muted" />
              <select
                className="bg-transparent outline-none text-sm font-bold text-kilari-main w-full"
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                <option value="">Select a slot</option>
                <option value="overnight">Overnight (8 PM - 8 AM)</option>
                <option value="daytime">Daytime (8 AM - 8 PM)</option>
              </select>
            </div>
            <Button
              className="h-14 px-8 rounded-full text-lg whitespace-nowrap"
              disabled={!selectedSlot}
              onClick={() => {}} // Trigger booking request
            >
              Request
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
