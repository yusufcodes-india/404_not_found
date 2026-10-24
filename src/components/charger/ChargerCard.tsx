"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Zap, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface ChargerCardProps {
  charger: {
    id: string;
    name: string;
    area: string;
    power: string;
    connector: string;
    price: string;
    score: number;
    easeScore: number;
    healthScore: number;
    distance: string;
    eta: string;
    rating: number;
  };
  activeMetric: 'score' | 'ease' | 'health';
  onClick?: () => void;
}

export const ChargerCard = ({ charger, activeMetric, onClick }: ChargerCardProps) => {
  const metricMap = {
    score: { label: 'Kilari Score', value: charger.score, color: 'text-kilari-primary' },
    ease: { label: 'Ease of travel', value: charger.easeScore, color: 'text-blue-600' },
    health: { label: 'Charger health', value: charger.healthScore, color: 'text-green-600' },
  };

  const currentMetric = metricMap[activeMetric];

  return (
    <Link
      href={`/charger/${charger.id}`}
      onClick={onClick}
      className="block w-full"
    >
      <Card padding="md" className="hover:border-kilari-primary transition-all cursor-pointer group">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-kilari-main text-lg group-hover:text-kilari-primary transition-colors">
              {charger.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-kilari-muted">
              <MapPin size={12} />
              {charger.area} • {charger.distance} ({charger.eta})
            </div>
          </div>
          <Badge variant="success">{charger.price}/kWh</Badge>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-xs font-medium text-kilari-main bg-kilari-card-border px-2 py-1 rounded-lg">
            <Zap size={14} className="text-kilari-primary" />
            {charger.power} • {charger.connector}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-kilari-main">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            {charger.rating}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-kilari-card-border">
          <span className="text-xs text-kilari-muted font-medium">{currentMetric.label}</span>
          <span className={cn('text-sm font-extrabold', currentMetric.color)}>
            {currentMetric.value}
          </span>
        </div>
      </Card>
    </Link>
  );
};
