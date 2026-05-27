import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { CropwayGisLogo } from '@/components/CropwayGisLogo';
import { cn } from '@/lib/utils';

export function AuthScene({
  children,
  showBack = false,
  backHref = '/login',
}: {
  children: ReactNode;
  showBack?: boolean;
  backHref?: string;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.02fr]">
        <div className="relative hidden overflow-hidden bg-[#eef5ff] lg:block">
          <Image
            src="/auth-landscape.svg"
            alt="Cropway rural landscape"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="flex min-h-screen flex-col bg-white px-8 py-8 sm:px-12 lg:px-[72px] lg:py-[52px]">
          <div className="flex items-center justify-between">
            <CropwayGisLogo className="min-h-8" />
          </div>

          <div
            className={cn(
              'mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center',
              showBack ? 'gap-8' : 'gap-10'
            )}
          >
            {showBack ? (
              <div>
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-greenLight px-4 py-2 font-montserrat text-[14px] font-medium text-greenDark"
                >
                  <span aria-hidden="true">←</span>
                  <span>Back</span>
                </Link>
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
