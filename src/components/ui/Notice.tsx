import * as React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NoticeProps {
  message: string;
  type?: 'info' | 'warning';
  className?: string;
}

export const Notice = ({ message, type = 'info', className }: NoticeProps) => {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border-1.5 border-kilari-notice-border bg-kilari-notice',
        className
      )}
    >
      <div className="mt-0.5 text-kilari-primary">
        {type === 'info' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
      </div>
      <p className="text-sm text-kilari-main leading-relaxed">{message}</p>
    </div>
  );
};
