import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValid?: (phone: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onValid, ...props }, ref) => {
    const [value, setValue] = React.useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      const cleaned = raw.replace(/^(\+91|91|0)/, '');
      const limited = cleaned.slice(0, 10);

      setValue(limited);
      if (props.onChange) props.onChange(e);
      if (onValid && /^[6-9]\d{9}$/.test(limited)) {
        onValid(limited);
      }
    };

    const formatPhone = (val: string) => {
      if (!val) return '';
      const match = val.match(/^(\d{5})(\d{5})$/);
      return match ? `${match[1]} ${match[2]}` : val;
    };

    return (
      <div className="flex items-center border-1.5 rounded-2xl h-14 overflow-hidden transition-all focus-within:border-kilari-primary focus-within:ring-2 focus-within:ring-kilari-primary/20 border-kilari-card-border">
        <div className="bg-kilari-card-border px-4 h-full flex items-center text-sm font-bold text-kilari-muted">
          🇮🇳 +91
        </div>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          className="flex-1 px-4 outline-none text-kilari-main font-medium"
          value={formatPhone(value)}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
