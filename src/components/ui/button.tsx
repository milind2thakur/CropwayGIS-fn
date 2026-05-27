import * as React from 'react';

import { cn } from '@/lib/utils';

const variants = {
  ghost: 'border-transparent bg-transparent text-ink hover:bg-greenLightHover',
  primary: 'border-transparent bg-greenDark text-white hover:bg-greenDarkHover',
  secondary: 'border-transparent bg-greenLightHover text-greenDarkHover hover:bg-greenLightActive',
};

const sizes = {
  large: 'h-[43px] rounded-[9px] px-5 py-[10px] font-montserrat text-[18px] font-medium leading-[130%]',
  largeIcon: 'h-[43px] rounded-[9px] px-5 py-[10px] font-montserrat text-[18px] font-medium leading-[130%]',
  medium: 'h-[28px] rounded-[6px] px-[10px] py-[5px] font-montserrat text-[14px] font-medium leading-[130%]',
  small: 'h-[19px] rounded-[4px] px-[6px] py-[3px] font-montserrat text-[10px] font-medium leading-[130%]',
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({ className, variant = 'primary', size = 'large', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-[10px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenDark disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
