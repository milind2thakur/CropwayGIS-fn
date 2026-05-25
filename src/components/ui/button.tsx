import * as React from 'react';

import { cn } from '@/lib/utils';

const variants = {
  ghost: 'border-transparent bg-transparent text-ink hover:bg-mossPale',
  primary: 'border-transparent bg-moss text-white hover:bg-[#294f1f]',
  secondary: 'border-transparent bg-mossPale text-moss hover:bg-[#d7e2d1]',
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

