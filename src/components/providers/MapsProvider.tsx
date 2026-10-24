"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { flags } from '@/lib/flags';

interface MapsContextType {
  google: any;
  isLoaded: boolean;
  isDemo: boolean;
}

const MapsContext = createContext<MapsContextType | null>(null);

export const MapsProvider = ({ children }: { children: React.ReactNode }) => {
  const [google, setGoogle] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isDemo = flags.demoMode || !flags.hasMapsKey;

  useEffect(() => {
    if (isDemo) {
      setIsLoaded(true);
      return;
    }

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then((g) => {
      setGoogle(g);
      setIsLoaded(true);
    }).catch(err => {
      console.error('Google Maps load error:', err);
      setIsLoaded(true); // Fallback to demo mode if load fails
    });
  }, []);

  return (
    <MapsContext.Provider value={{ google, isLoaded, isDemo }}>
      {children}
    </MapsContext.Provider>
  );
};

export const useMaps = () => {
  const context = useContext(MapsContext);
  if (!context) throw new Error('useMaps must be used within a MapsProvider');
  return context;
};
