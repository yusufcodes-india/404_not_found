"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // In a real app, we'd check session here.
    // For now, we just simulate the splash delay.
    const timer = setTimeout(() => {
      router.push('/login');
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-kilari-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-kilari-light-green rounded-3xl flex items-center justify-center shadow-sm mb-6 animate-in fade-in zoom-in duration-700">
        <Zap size={48} className="text-kilari-primary" />
      </div>
      <h1 className="text-4xl font-extrabold text-kilari-main tracking-tight mb-3">
        Kilari
      </h1>
      <p className="text-kilari-muted text-sm max-w-[260px] leading-relaxed">
        Turning idle community chargers into reliable local power.
      </p>
    </div>
  );
}
