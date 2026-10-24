"use client";

import React, { useEffect, useRef } from 'react';
import { useMaps } from '@/components/providers/MapsProvider';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChargerMapProps {
  chargers: any[];
  selectedId?: string;
  onMarkerClick?: (id: string) => void;
}

export const ChargerMap = ({ chargers, selectedId, onMarkerClick }: ChargerMapProps) => {
  const { google, isLoaded, isDemo } = useMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!isLoaded || isDemo || !mapRef.current || !google) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 18.5597, lng: 73.8100 }, // Pune
      zoom: 13,
      disableDefaultUI: true,
      styles: [], // Custom map styles would go here
    });

    mapInstance.current = map;

    chargers.forEach(charger => {
      new google.maps.Marker({
        position: { lat: charger.approx_lat, lng: charger.approx_lng },
        map,
        title: charger.name,
        icon: charger.id === selectedId ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      });
    });
  }, [isLoaded, isDemo, google, chargers, selectedId]);

  if (!isLoaded) return <div className="w-full h-full bg-kilari-card animate-pulse" />;

  if (isDemo) {
    return (
      <div className="relative w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4b7a3f 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 flex flex-col items-center text-center p-6">
          <MapPin size={48} className="text-kilari-primary mb-4 animate-bounce" />
          <h3 className="font-bold text-kilari-main">Demo Map View</h3>
          <p className="text-sm text-kilari-muted max-w-xs">
            Live maps disabled. Markers are simulated based on coordinates.
          </p>
        </div>
        {chargers.map((c, i) => (
          <div
            key={c.id}
            className={cn(
              'absolute w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer transition-all hover:scale-125',
              c.id === selectedId ? 'bg-kilari-primary scale-125' : 'bg-red-500'
            )}
            style={{
              left: `${(c.approx_lng - 73.7) * 1000}%`,
              top: `${(18.6 - c.approx_lat) * 1000}%`,
            }}
            onClick={() => onMarkerClick?.(c.id)}
          />
        ))}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-kilari-muted uppercase tracking-widest border border-kilari-card-border">
          Demo Mode Active
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
};
