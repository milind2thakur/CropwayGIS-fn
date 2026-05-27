'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';

import { AuthScene } from './AuthScene';

type LoginRole = 'Farmer' | 'FPOs' | 'KVK';

export function LoginPage() {
  const [role, setRole] = useState<LoginRole>('Farmer');
  const [phone, setPhone] = useState('');

  const canContinue = useMemo(() => phone.trim().length >= 10, [phone]);

  return (
    <AuthScene>
      <div className="space-y-10">
        <div className="space-y-8">
          <h1 className="font-montserrat text-[68px] font-medium leading-[0.95] text-black/35">
            Login
          </h1>

          <div className="space-y-3">
            <p className="font-montserrat text-[18px] font-medium text-ink">Login as</p>
            <div className="flex items-center gap-5">
              {(['Farmer', 'FPOs', 'KVK'] as const).map((item) => {
                const isActive = role === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    className={
                      isActive
                        ? 'rounded-[12px] bg-greenDark px-6 py-3 font-montserrat text-[18px] font-medium text-white'
                        : 'rounded-[12px] border border-black/12 bg-white px-6 py-3 font-montserrat text-[18px] font-medium text-black/35'
                    }
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block font-montserrat text-[18px] font-medium text-ink">
            Phone number
          </label>
          <input
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/[^\d+\s-]/g, ''))}
            placeholder="Enter your phone number here"
            className="h-[72px] w-full rounded-[18px] border border-black/15 px-5 font-montserrat text-[20px] font-medium text-ink outline-none placeholder:text-black/30 focus:border-greenDark focus:ring-2 focus:ring-greenLightActive"
          />
        </div>

        <div className="space-y-4">
          <Link href="/login/otp" className={canContinue ? 'block' : 'pointer-events-none block'}>
            <Button
              disabled={!canContinue}
              className="h-[74px] w-full rounded-[18px] bg-greenDark font-montserrat text-[22px] font-medium text-white hover:bg-greenDarkHover"
            >
              Get OTP
            </Button>
          </Link>

          <p className="text-center font-montserrat text-[18px] font-medium text-ink">
            Don&apos;t have account?{' '}
            <Link href="/login" className="text-[#2D63FF] underline underline-offset-2">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </AuthScene>
  );
}
