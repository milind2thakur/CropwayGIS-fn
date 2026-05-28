'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RegisterFormData } from './RegisterPage';

type StepProps = {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  onNext: () => void;
};

export function RegisterPersonalDetails({ formData, updateFormData, onNext }: StepProps) {
  const handleClear = () => {
    updateFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      state: 'Chhattisgarh',
      city: 'Raipur',
      pin: '',
      detailedAddress: '',
    });
  };

  const isFormValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.phone.trim().length >= 10 &&
    formData.pin.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Name Fields */}
        <div className="space-y-2">
          <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
            First name
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            placeholder="First name"
            className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
            Last name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            placeholder="Last name"
            className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Contact Fields */}
        <div className="space-y-2">
          <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="abc@gmail.com"
            className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
            Phone no.
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value.replace(/[^\d+\s-]/g, '') })}
            placeholder="+91 1234567890"
            className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
          />
        </div>
      </div>

      <div className="border-t border-black/5 pt-4">
        <h4 className="font-montserrat text-[15px] font-semibold text-black/55 mb-4">Address</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {/* State & City Dropdowns */}
          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              State
            </label>
            <select
              value={formData.state}
              onChange={(e) => updateFormData({ state: e.target.value })}
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none bg-white focus:border-greenDark"
            >
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Odisha">Odisha</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              City
            </label>
            <select
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none bg-white focus:border-greenDark"
            >
              <option value="Raipur">Raipur</option>
              <option value="Bilaspur">Bilaspur</option>
              <option value="Durg">Durg</option>
              <option value="Bhilai">Bhilai</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-end gap-3 mt-4">
          {/* Pin & Pin Point Button */}
          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              Pin
            </label>
            <input
              type="text"
              value={formData.pin}
              onChange={(e) => updateFormData({ pin: e.target.value.replace(/\D/g, '') })}
              placeholder="492001"
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
            />
          </div>
          <button
            type="button"
            className="flex h-12 items-center gap-1.5 rounded-[10px] bg-greenLight px-4 font-montserrat text-[13px] font-semibold text-greenDark border border-greenLightActive hover:bg-greenLightActive transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>Pin Point</span>
          </button>
        </div>

        {/* Detailed Address */}
        <div className="space-y-2 mt-4">
          <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
            Detailed Address
          </label>
          <textarea
            value={formData.detailedAddress}
            onChange={(e) => updateFormData({ detailedAddress: e.target.value })}
            placeholder="Q6, Anupam nagar, Shankar nagar."
            rows={3}
            className="w-full rounded-[10px] border border-black/15 p-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4">
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
          Next
        </Button>
      </div>
    </div>
  );
}
