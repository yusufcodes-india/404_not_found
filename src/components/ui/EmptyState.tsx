import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({ title, description, icon, action, className }: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-kilari-card-border rounded-[26px]', className)}>
      {icon && <div className="mb-4 text-kilari-muted">{icon}</div>}
      <h3 className="text-lg font-bold text-kilari-main mb-2">{title}</h3>
      <p className="text-sm text-kilari-muted mb-6 max-w-xs">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
