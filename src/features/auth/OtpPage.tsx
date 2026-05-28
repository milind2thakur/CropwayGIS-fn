'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

import { AuthScene } from './AuthScene';

export function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const phone = searchParams.get('phone') ?? '';
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete = useMemo(() => otp.every((digit) => digit.length === 1), [otp]);

  const handleSubmit = async () => {
    if (!isComplete) return;
    setIsLoading(true);
    setError(null);
    try {
      const otpValue = otp.join('');
      const response = await apiFetch<{ data: { token: string; user: any } }>('/api/v1/auth/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: phone,
          otp: otpValue,
        }),
      });
      
      login(response.data.token, response.data.user);
      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScene showBack backHref="/login">
      <div className="flex flex-col items-center gap-[7px] w-[315px] mx-auto">
        <div className="flex flex-col items-start gap-[26px] w-full shrink-0">
          <div className="flex flex-col items-start gap-[12px] w-full shrink-0">
            <h1 className="font-montserrat text-[40px] font-bold leading-[130%] text-black/40">
              Enter OTP
            </h1>
            <p className="font-sans text-[14px] font-medium leading-[140%] text-black/80 leading-relaxed">
              We&apos;ve sent you OTP at your entered mobile number {phone ? `(${phone})` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-[12px] w-full shrink-0 pt-[26px]">
          <div className="flex flex-col items-start gap-[3px] w-full shrink-0">
            <p className="font-sans text-[14px] font-medium leading-[140%] text-black/80">
              OTP will expire in
            </p>
            <div className="inline-flex rounded-[10px] border border-greenLightActive bg-greenLight px-3 py-1.5 font-sans text-[14px] font-bold text-greenNormal shadow-sm">
              00:29
            </div>
          </div>

          <div className="flex flex-col items-start gap-[3px] w-full shrink-0 pt-2">
            <label className="font-sans text-[14px] font-medium leading-[140%] text-black/80">
              Enter OTP
            </label>
            <OtpInput value={otp} onChange={setOtp} />
            {error && <p className="font-sans text-red-500 text-[12px] font-medium mt-1">{error}</p>}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isComplete || isLoading}
            className="h-[48px] w-full rounded-[10px] bg-[#2B4D1A] font-inter text-[14px] font-bold leading-[140%] text-white hover:bg-[#203a13] border border-black/15 transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Submit OTP'}
          </Button>
        </div>
      </div>
    </AuthScene>
  );
}
