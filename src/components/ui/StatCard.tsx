import * as React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard = ({ label, value, icon, className }: StatCardProps) => {
  return (
    <Card padding="md" className={cn('flex flex-col items-center text-center', className)}>
      {icon && <div className="mb-2 text-kilari-primary">{icon}</div>}
      <div className="text-2xl font-bold text-kilari-main">{value}</div>
      <div className="text-sm text-kilari-muted uppercase tracking-wider">{label}</div>
    </Card>
  );
};
