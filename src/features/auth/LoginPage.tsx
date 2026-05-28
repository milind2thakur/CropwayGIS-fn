'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/client';
import { cn } from '@/lib/utils';

import { AuthScene } from './AuthScene';

type LoginRole = 'Farmer' | 'FPOs' | 'KVK';

export function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>('Farmer');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => phone.trim().length >= 10, [phone]);

  const handleGetOtp = async () => {
    if (!canContinue) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiFetch('/api/v1/auth/send-otp/', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone }),
      });
      router.push(`/login/otp?phone=${phone}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScene>
      <div className="flex flex-col items-center gap-[7px] w-[315px] mx-auto">
        {/* Frame 1948761050 (Header & Role Selector) */}
        <div className="flex flex-col items-start gap-[26px] w-full shrink-0">
          {/* Header block */}
          <div className="flex flex-col items-start gap-[12px] w-full shrink-0">
            <h1 className="font-montserrat text-[40px] font-bold leading-[130%] text-black/40">
              Login
            </h1>
            
            <div className="flex flex-col items-start gap-[3px] w-full shrink-0">
              <p className="font-montserrat text-[10px] font-medium leading-[130%] text-black/70">
                Login as
              </p>
              
              {/* Tabs */}
              <div className="flex flex-row items-center gap-[15px] w-full shrink-0">
                {(['Farmer', 'FPOs', 'KVK'] as const).map((item) => {
                  const isActive = role === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      className={
                        isActive
                          ? 'box-sizing-border-box flex flex-row justify-center items-center px-[10px] py-[8px] rounded-[6px] bg-[#2B4D1A] font-poppins text-[12px] font-normal leading-[32px] text-white outline-none h-[24px]'
                          : 'box-sizing-border-box flex flex-row justify-center items-center px-[10px] py-[8px] rounded-[6px] border border-black/15 bg-transparent opacity-50 font-poppins text-[12px] font-normal leading-[32px] text-black outline-none h-[24px]'
                      }
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Form Inputs (Phone Number & Buttons) */}
        <div className="flex flex-col items-start gap-[12px] w-full shrink-0 pt-[26px]">
          <div className="flex flex-col items-start gap-[3px] w-full shrink-0">
            <label className="font-sans text-[14px] font-medium leading-[140%] text-black/80">
              Phone number
            </label>
            <input
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/[^\d+\s-]/g, ''))}
              placeholder="Enter your phone number here"
              className="h-[48px] w-full rounded-[10px] border border-black/15 bg-white px-[10px] font-sans text-[14px] font-medium leading-[140%] text-black outline-none placeholder:text-black/40 focus:border-[#2B4D1A]"
            />
            {error && <p className="font-sans text-red-500 text-[12px] font-medium mt-1">{error}</p>}
          </div>

          <Button
            onClick={handleGetOtp}
            disabled={!canContinue || isLoading}
            className="h-[48px] w-full rounded-[10px] bg-[#2B4D1A] font-inter text-[14px] font-bold leading-[140%] text-white hover:bg-[#203a13] border border-black/15 transition-colors"
          >
            {isLoading ? 'Sending...' : 'Get OTP'}
          </Button>

          <p className="w-full text-center font-sans text-[14px] font-medium leading-[140%] text-black">
            Don&apos;t have account?{' '}
            <Link href="/register" className="text-[#2D63FF] underline underline-offset-2 hover:text-blue-700 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </AuthScene>
  );
}
