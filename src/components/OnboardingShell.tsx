"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingShellProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  footerAction?: React.ReactNode;
}

export const OnboardingShell = ({
  children,
  step,
  totalSteps,
  title,
  showBack = true,
  onBack,
  footerAction,
}: OnboardingShellProps) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-kilari-bg flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={onBack || (() => router.back())}
              className="p-2 rounded-full hover:bg-kilari-card transition-colors"
            >
              <ArrowLeft size={24} className="text-kilari-main" />
            </button>
          )}
          <div>
            <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest">
              Step {step} of {totalSteps}
            </p>
            <h1 className="text-2xl font-extrabold text-kilari-main">{title}</h1>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-10">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < step ? 'bg-kilari-primary' : 'bg-kilari-card-border'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Sticky Footer */}
      {footerAction && (
        <div className="mt-auto pt-6 pb-10">
          {footerAction}
        </div>
      )}
    </div>
  );
};
