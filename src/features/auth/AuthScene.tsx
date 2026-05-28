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
    <div className="h-screen w-screen bg-white overflow-hidden">
      <div className="grid h-full lg:grid-cols-[1fr_1.02fr]">
        <div className="relative hidden overflow-hidden bg-[#eef5ff] lg:block h-full">
          <img
            src="/auth-landscape.svg"
            alt="Cropway rural landscape"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>

        <div className="flex h-full flex-col bg-white px-8 py-6 sm:px-12 lg:px-[72px] lg:py-[40px] overflow-hidden">
          <div className="flex items-center justify-between shrink-0">
            <CropwayGisLogo className="min-h-8" />
          </div>

          <div
            className={cn(
              'mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center shrink-0',
              showBack ? 'gap-6' : 'gap-8'
            )}
          >
            {showBack ? (
              <div className="shrink-0">
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-greenLight px-4 py-2 font-montserrat text-[14px] font-medium text-greenDark"
                >
                  <span aria-hidden="true">←</span>
                  <span>Back</span>
                </Link>
              </div>
            ) : null}
            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
