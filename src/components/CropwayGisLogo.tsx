import Image from 'next/image';

import { cn } from '@/lib/utils';

type CropwayGisLogoProps = {
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  showWordmark?: boolean;
};

export function CropwayGisLogo({
  className,
  iconClassName,
  labelClassName,
  showWordmark = true,
}: CropwayGisLogoProps) {
  if (!showWordmark) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Image
          src="/cropway-logo.png"
          alt="Cropway GIS icon"
          width={120}
          height={28}
          priority
          unoptimized
          className={cn('h-7 w-auto shrink-0 object-contain', iconClassName)}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/cropway-logo.png"
        alt="Cropway logo"
        width={2048}
        height={299}
        priority
        unoptimized
        className={cn('h-8 w-auto shrink-0 object-contain', iconClassName)}
      />
      {labelClassName ? <span className={labelClassName} aria-hidden="true" /> : null}
    </div>
  );
}
