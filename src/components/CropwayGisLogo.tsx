import Image from 'next/image';

type CropwayGisLogoProps = {
  className?: string;
};

export function CropwayGisLogo({ className }: CropwayGisLogoProps) {
  return (
    <Image
      src="/cropway-logo.png"
      alt="Cropway logo"
      width={2048}
      height={299}
      priority
      className={className}
    />
  );
}
