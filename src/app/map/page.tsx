"use client";

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { ChargerMap } from '@/components/map/ChargerMap';
import { ChargerCard } from '@/components/charger/ChargerCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MapPage() {
  const [sort, setSort] = useState<'score' | 'ease' | 'health'>('score');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(true);
  const [filters, setFilters] = useState({ connector: '', vehicle: '', slot: '' });

  // Mock data for demo - in real app, this comes from Supabase
  const [chargers, setChargers] = useState([
    {
      id: '1',
      name: 'Baner Home Power',
      area: 'Baner',
      power: '7.2kW',
      connector: 'Type 2',
      price: '₹14',
      score: 87,
      easeScore: 81,
      healthScore: 92,
      distance: '1.2 km',
      eta: '4 mins',
      rating: 4.8,
      approx_lat: 18.5597,
      approx_lng: 73.8100,
    },
    {
      id: '2',
      name: 'Aundh Society Hub',
      area: 'Aundh',
      power: '25kW',
      connector: 'CCS2',
      price: '₹14',
      score: 72,
      easeScore: 65,
      healthScore: 88,
      distance: '3.5 km',
      eta: '12 mins',
      rating: 4.2,
      approx_lat: 18.5600,
      approx_lng: 73.8200,
    },
    {
      id: '3',
      name: 'Hinjawadi Office Spot',
      area: 'Hinjawadi',
      power: '7.2kW',
      connector: 'Type 2',
      price: '₹14',
      score: 91,
      easeScore: 42,
      healthScore: 98,
      distance: '8.1 km',
      eta: '22 mins',
      rating: 4.9,
      approx_lat: 18.5913,
      approx_lng: 73.7389,
    },
  ]);

  const sortedChargers = [...chargers].sort((a, b) => {
    if (sort === 'score') return b.score - a.score;
    if (sort === 'ease') return b.easeScore - a.easeScore;
    if (sort === 'health') return b.healthScore - a.healthScore;
    return 0;
  });

  return (
    <AppShell>
      <div className="relative h-screen w-full overflow-hidden flex flex-col">
        {/* Top Header & Filters */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex flex-col gap-3 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search area, charger..."
                className="w-full h-12 px-4 pl-10 rounded-full bg-white/90 backdrop-blur shadow-sm border border-kilari-card-border outline-none focus:ring-2 focus:ring-kilari-primary/20"
              />
              <div className="absolute left-3 top-3 text-kilari-muted">
                <Filter size={18} />
              </div>
            </div>
            <div className="relative group pointer-events-auto">
              <button
                onClick={() => {}} // Toggle sort menu
                className="h-12 px-4 rounded-full bg-white/90 backdrop-blur shadow-sm border border-kilari-card-border flex items-center gap-2 font-bold text-kilari-main text-sm"
              >
                Sort: {sort === 'score' ? 'Score' : sort === 'ease' ? 'Ease' : 'Health'}
                <ChevronDown size={16} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-kilari-card-border p-2 hidden group-hover:block z-50">
                {['score', 'ease', 'health'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSort(s as any)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                      sort === s ? 'bg-kilari-notice text-kilari-primary' : 'text-kilari-muted hover:bg-kilari-card'
                    )}
                  >
                    {s === 'score' ? 'Kilari Score' : s === 'ease' ? 'Ease of travel' : 'Charger health'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Component */}
        <div className="flex-1 relative">
          <ChargerMap
            chargers={chargers}
            selectedId={selectedId}
            onMarkerClick={setSelectedId}
          />
        </div>

        {/* Bottom Sheet List */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-kilari-bg rounded-t-[32px] shadow-2xl transition-all duration-500 ease-in-out z-30 border-t border-kilari-card-border',
            isListOpen ? 'h-[60vh]' : 'h-14'
          )}
        >
          <div
            className="h-14 flex items-center justify-center cursor-pointer"
            onClick={() => setIsListOpen(!isListOpen)}
          >
            <div className="w-12 h-1.5 bg-kilari-card-border rounded-full" />
            <span className="ml-2 text-xs font-bold text-kilari-muted uppercase tracking-widest">
              {isListOpen ? 'Hide' : 'Nearby Chargers'}
            </span>
            {isListOpen ? <ChevronDown size={16} className="ml-2" /> : <ChevronUp size={16} className="ml-2" />}
          </div>

          {isListOpen && (
            <div className="p-6 overflow-y-auto h-full pb-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-kilari-main">
                  {sortedChargers.length} Chargers found
                </h3>
                <Badge variant="default">Pune, MH</Badge>
              </div>

              <div className="flex flex-col gap-4">
                {sortedChargers.map(charger => (
                  <ChargerCard
                    key={charger.id}
                    charger={charger}
                    activeMetric={sort}
                    onClick={() => {
                      setSelectedId(charger.id);
                      setIsListOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
