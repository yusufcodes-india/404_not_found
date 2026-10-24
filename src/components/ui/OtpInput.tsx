import * as React from 'react';
import { cn } from '@/lib/utils';

export interface OtpInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const OtpInput = ({ length = 6, onComplete, error, disabled, className }: OtpInputProps) => {
  const [otp, setOtp] = React.useState(new Array(length).fill(''));
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    const char = value.slice(-1);
    if (!/^\d$/.test(char) && char !== '') return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    const combinedOtp = newOtp.join('');
    if (combinedOtp.length === length && onComplete) {
      onComplete(combinedOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').slice(0, length).replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    paste.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputsRef.current[Math.min(paste.length, length - 1)].focus();
    if (paste.length === length && onComplete) {
      onComplete(paste);
    }
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-bold rounded-2xl border-1.5 outline-none transition-all',
            'bg-white border-kilari-card-border focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20',
            error && 'border-red-500 bg-red-50'
          )}
        />
      ))}
    </div>
  );
};
