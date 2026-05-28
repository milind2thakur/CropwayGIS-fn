'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RegisterFormData } from './RegisterPage';

type StepProps = {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  onNext: () => void;
};

export function RegisterLandDetails({ formData, updateFormData, onNext }: StepProps) {
  const handleClear = () => {
    updateFormData({
      landDistrict: '',
      landTaluka: '',
      landVillage: '',
      landSurveyNo: '',
      landKhataNo: '',
      landTotalArea: '0.00',
      landTotalAreaUnit: 'Acre',
      landActualArea: '0.00',
      landActualAreaUnit: 'Acre',
      landOwnerName: '',
    });
  };

  const isFormValid =
    formData.landDistrict.trim().length > 0 &&
    formData.landTaluka.trim().length > 0 &&
    formData.landVillage.trim().length > 0 &&
    formData.landSurveyNo.trim().length > 0 &&
    formData.landKhataNo.trim().length > 0 &&
    formData.landOwnerName.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-montserrat text-[15px] font-semibold text-black/55">Address</h4>

        <div className="grid grid-cols-3 gap-4">
          {/* State, District, Taluka */}
          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              State
            </label>
            <select
              value={formData.state}
              disabled
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none bg-[#F3F6F9] text-black/50"
            >
              <option value="Chhattisgarh">Chhattisgarh</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              District
            </label>
            <input
              type="text"
              value={formData.landDistrict}
              onChange={(e) => updateFormData({ landDistrict: e.target.value })}
              placeholder="District name"
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              Taluka
            </label>
            <input
              type="text"
              value={formData.landTaluka}
              onChange={(e) => updateFormData({ landTaluka: e.target.value })}
              placeholder="Enter Taluka name"
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Village, Survey No., Khata no. */}
          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              Village
            </label>
            <input
              type="text"
              value={formData.landVillage}
              onChange={(e) => updateFormData({ landVillage: e.target.value })}
              placeholder="Enter Village name"
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              Survey No.
            </label>
            <input
              type="text"
              value={formData.landSurveyNo}
              onChange={(e) => updateFormData({ landSurveyNo: e.target.value })}
              placeholder="Enter Survey No."
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
              Khata no.
            </label>
            <input
              type="text"
              value={formData.landKhataNo}
              onChange={(e) => updateFormData({ landKhataNo: e.target.value })}
              placeholder="Enter Khata no."
              className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3 pt-4 border-t border-black/5">
        {/* Total Area */}
        <div className="space-y-2">
          <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
            Total area
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.landTotalArea}
              onChange={(e) => updateFormData({ landTotalArea: e.target.value })}
              className="h-12 w-full rounded-[10px] border border-black/15 pl-4 pr-16 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
            />
            <select
              value={formData.landTotalAreaUnit}
              onChange={(e) => updateFormData({ landTotalAreaUnit: e.target.value })}
              className="absolute right-2 top-2 h-8 rounded-[6px] border border-black/10 px-2 font-montserrat text-[12px] bg-white outline-none"
            >
              <option value="Acre">Acre</option>
              <option value="Hectare">Hectare</option>
            </select>
          </div>
        </div>

        {/* Actual Sowing Area */}
        <div className="space-y-2">
          <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
            Actual sowing area
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.landActualArea}
              onChange={(e) => updateFormData({ landActualArea: e.target.value })}
              className="h-12 w-full rounded-[10px] border border-black/15 pl-4 pr-16 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
            />
            <select
              value={formData.landActualAreaUnit}
              onChange={(e) => updateFormData({ landActualAreaUnit: e.target.value })}
              className="absolute right-2 top-2 h-8 rounded-[6px] border border-black/10 px-2 font-montserrat text-[12px] bg-white outline-none"
            >
              <option value="Acre">Acre</option>
              <option value="Hectare">Hectare</option>
            </select>
          </div>
        </div>

        {/* Draw in Map Button */}
        <button
          type="button"
          className="flex h-12 items-center gap-1.5 rounded-[10px] bg-greenLight px-4 font-montserrat text-[13px] font-semibold text-greenDark border border-greenLightActive hover:bg-greenLightActive transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Draw in map</span>
        </button>
      </div>

      {/* Land Owner */}
      <div className="space-y-2">
        <label className="block font-montserrat text-[14px] font-semibold text-[#222222]">
          Land Owner
        </label>
        <input
          type="text"
          value={formData.landOwnerName}
          onChange={(e) => updateFormData({ landOwnerName: e.target.value })}
          placeholder="Owner name"
          className="h-12 w-full rounded-[10px] border border-black/15 px-4 font-montserrat text-[15px] font-medium outline-none focus:border-greenDark"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-6 border-t border-black/5">
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
          Register
        </Button>
      </div>
    </div>
  );
}
