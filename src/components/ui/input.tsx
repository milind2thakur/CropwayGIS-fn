import * as React from 'react';

import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-moss focus:ring-2 focus:ring-[#d9e5d2]',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

