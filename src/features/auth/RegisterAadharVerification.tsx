'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { RegisterFormData } from './RegisterPage';

type StepProps = {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  onNext: () => void;
};

export function RegisterAadharVerification({ formData, updateFormData, onNext }: StepProps) {
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleClear = () => {
    updateFormData({
      aadharNumber: '',
      aadharConsent: true,
      aadharOtp: '',
    });
    setIsOtpSent(false);
  };

  const handleSendOtp = () => {
    if (formData.aadharNumber.trim().length > 0) {
      setIsOtpSent(true);
    }
  };

  const isFormValid =
    formData.aadharNumber.trim().length > 0 &&
    formData.aadharConsent &&
    (!isOtpSent || formData.aadharOtp.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Aadhaar Number Field */}
      <div className="space-y-2">
        <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
          Aadhar number
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <input
            type="text"
            value={formData.aadharNumber}
            onChange={(e) => updateFormData({ aadharNumber: e.target.value.replace(/\D/g, '') })}
            placeholder="Enter 16 digit aadhar number here"
            className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
          />
          <button
            type="button"
            onClick={handleSendOtp}
            className="h-12 rounded-[10px] bg-greenLight px-5 font-montserrat text-[13px] font-semibold text-greenDark border border-greenLightActive hover:bg-greenLightActive transition-colors"
          >
            Send OTP
          </button>
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="consent"
          checked={formData.aadharConsent}
          onChange={(e) => updateFormData({ aadharConsent: e.target.checked })}
          className="h-4 w-4 rounded border-black/15 text-greenDark focus:ring-greenDark"
        />
        <label htmlFor="consent" className="font-montserrat text-[13px] font-medium text-black/75">
          I Consent to for Authentication
        </label>
      </div>

      {/* Conditionally rendered OTP Fields */}
      {isOtpSent && (
        <div className="space-y-4 border-t border-black/5 pt-4">
          <p className="font-montserrat text-[12px] font-medium text-black/45">
            We&apos;ve sent OTP to registered mobile number
          </p>

          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              Submit OTP
            </label>
            <input
              type="text"
              value={formData.aadharOtp}
              onChange={(e) => updateFormData({ aadharOtp: e.target.value.replace(/\D/g, '') })}
              placeholder="0"
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-6">
        <Button
          type="button"
          onClick={handleClear}
          className="h-12 flex-1 rounded-[12px] bg-[#E8EFE5] font-montserrat text-[16px] font-semibold text-[#407327] hover:bg-[#dce9d8]"
        >
          Clear
        </Button>
        <Button
          type="button"
          disabled={!isFormValid}
          onClick={onNext}
          className="h-12 flex-1 rounded-[12px] bg-greenDark font-montserrat text-[16px] font-semibold text-white hover:bg-greenDarkHover"
        >
          Verify
        </Button>
      </div>
    </div>
  );
}
