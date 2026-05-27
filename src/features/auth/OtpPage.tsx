'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';

import { AuthScene } from './AuthScene';

export function OtpPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);

  const isComplete = useMemo(() => otp.every((digit) => digit.length === 1), [otp]);

  return (
    <AuthScene showBack backHref="/login">
      <div className="space-y-10">
        <div className="space-y-5">
          <h1 className="font-montserrat text-[68px] font-medium leading-[0.95] text-black/35">
            Enter OTP
          </h1>
          <p className="font-montserrat text-[18px] font-medium text-black/55">
            We&apos;ve sent you OTP at your entered mobile number
          </p>
        </div>

        <div className="space-y-3">
          <p className="font-montserrat text-[18px] font-medium text-ink">OTP will be expire in</p>
          <div className="inline-flex rounded-[12px] border border-greenLightActive bg-greenLight px-4 py-2 font-montserrat text-[18px] font-medium text-greenNormal">
            00:29
          </div>
        </div>

        <div className="space-y-4">
          <label className="block font-montserrat text-[18px] font-medium text-ink">
            Enter OTP
          </label>
          <OtpInput value={otp} onChange={setOtp} />
        </div>

        <Button
          disabled={!isComplete}
          className="h-[74px] w-full rounded-[18px] bg-greenDark font-montserrat text-[22px] font-medium text-white hover:bg-greenDarkHover"
        >
          Submit OTP
        </Button>
      </div>
    </AuthScene>
  );
}
