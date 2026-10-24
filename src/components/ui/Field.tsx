import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  type?: 'text' | 'tel' | 'number' | 'password' | 'date';
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ className, label, hint, error, type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-bold text-kilari-main uppercase tracking-wide">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full h-14 px-4 rounded-2xl border-1.5 outline-none transition-all',
              'border-kilari-card-border focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20',
              error ? 'border-red-500' : '',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
            <span className="font-bold">!</span> {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-kilari-muted">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Field.displayName = 'Field';
