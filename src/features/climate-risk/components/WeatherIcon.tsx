import { Cloud, CloudRain, Sun, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';

export function WeatherIcon({
  icon,
  className,
}: {
  icon: 'sun' | 'cloud' | 'rain' | 'storm';
  className?: string;
}) {
  if (icon === 'storm') return <Zap className={cn('h-[26px] w-[26px]', className)} strokeWidth={1.5} />;
  if (icon === 'sun') return <Sun className={cn('h-[26px] w-[26px]', className)} strokeWidth={1.5} />;
  if (icon === 'rain') return <CloudRain className={cn('h-[26px] w-[26px]', className)} strokeWidth={1.5} />;
  return <Cloud className={cn('h-[26px] w-[26px]', className)} strokeWidth={1.5} />;
}

