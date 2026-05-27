'use client';

import { useMemo, useRef } from 'react';

import { cn } from '@/lib/utils';

type OtpInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  length?: number;
  className?: string;
};

export function OtpInput({
  value,
  onChange,
  length = 6,
  className,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const cells = useMemo(() => {
    const next = [...value];
    while (next.length < length) {
      next.push('');
    }
    return next.slice(0, length);
  }, [length, value]);

  const updateAt = (index: number, nextChar: string) => {
    const next = [...cells];
    next[index] = nextChar;
    onChange(next);
  };

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {cells.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => {
            const nextChar = event.target.value.replace(/\D/g, '').slice(-1);
            updateAt(index, nextChar);
            if (nextChar && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !cells[index] && index > 0) {
              refs.current[index - 1]?.focus();
            }
            if (event.key === 'ArrowLeft' && index > 0) {
              refs.current[index - 1]?.focus();
            }
            if (event.key === 'ArrowRight' && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length).split('');
            if (!pasted.length) {
              return;
            }
            const next = [...cells];
            pasted.forEach((char, offset) => {
              if (index + offset < length) {
                next[index + offset] = char;
              }
            });
            onChange(next);
            const focusIndex = Math.min(index + pasted.length, length - 1);
            refs.current[focusIndex]?.focus();
          }}
          className="h-[62px] w-[62px] rounded-[14px] border border-black/15 bg-white text-center font-montserrat text-[24px] font-medium text-ink outline-none transition focus:border-greenDark focus:ring-2 focus:ring-greenLightActive"
        />
      ))}
    </div>
  );
}
