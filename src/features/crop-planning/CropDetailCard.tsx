 'use client';

import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CropDetailCard() {
  const router = useRouter();
  const goToPortfolio = () => router.push('/crop-planning?step=portfolio&view=tabular');

  return (
    <div
      className="relative bg-white outline-none"
      style={{ width: '100%', height: '100%', borderRadius: 10 }}
    >
      <div className="absolute left-4 top-[9px] font-montserrat font-medium text-[14px] leading-[130%] text-black">
        Crop detail
      </div>

      <button
        className="absolute right-[9px] top-2 flex h-[19px] items-center justify-center gap-2 rounded-[6px] bg-[#E3ECDF] px-[10px]"
      >
        <span className="font-montserrat text-[10px] font-medium leading-[130%] text-[#203A13]">Tasks</span>
        <ExternalLink size={10} color="#203A13" />
      </button>

      <div className="absolute left-1/2 top-8 h-0 w-[300px] -translate-x-1/2 border-t border-black/20" />

      <div className="absolute left-[13px] top-[39px] flex w-[283px] flex-col gap-[9px]">
        <div className="rounded-[10px] border border-[#DADADA] border-[0.5px] bg-white px-[14px] py-[15px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-montserrat text-[8px] leading-[10px] text-[#222222]/60">Crop type</span>
              <span className="font-montserrat text-[12px] font-medium leading-[130%] text-black">Wheat</span>
            </div>
            <div className="h-7 w-0 border-l border-black/20" />
            <div className="flex flex-col gap-1">
              <span className="font-montserrat text-[8px] leading-[10px] text-[#222222]/60">Ploughing date</span>
              <span className="font-montserrat text-[12px] font-medium leading-[130%] text-black [text-decoration:none]">June - 2026</span>
            </div>
            <div className="h-7 w-0 border-l border-black/20" />
            <div className="flex flex-col gap-1">
              <span className="font-montserrat text-[8px] leading-[10px] text-black/60">Area</span>
              <span className="font-montserrat text-[12px] font-medium leading-[130%] text-black">1.5 Acer</span>
            </div>
          </div>

          <div className="my-2 h-0 w-full border-t border-black/20" />

          <div className="flex items-center gap-1">
            <MapPin size={12} color="#273B4A" />
            <span className="font-montserrat text-[10px] font-medium leading-[130%] text-black/70">
              Kendri, Dhamtari Rd, Raipur, CG
            </span>
          </div>
        </div>

        <div className="h-0 w-full border-t border-black/20" />

        <div className="flex flex-col gap-[6px]">
          <span className="font-montserrat text-[8px] leading-[10px] text-[#222222]/60">Progress</span>
          <div className="relative h-4 w-full overflow-hidden rounded-[30px] bg-[#47802B]/20">
            <div className="h-4 w-5 rounded-[30px] bg-[#47802B]" />
            <span className="absolute left-[1px] top-[3px] w-5 text-center font-montserrat text-[8px] leading-[10px] text-white">4%</span>
            <span className="absolute right-[5px] top-[3px] font-montserrat text-[8px] leading-[10px] text-black/50">100%</span>
          </div>
        </div>

        <div className="h-0 w-full border-t border-black/20" />

        <div className="relative h-[178px] rounded-[10px] border border-[#DADADA] border-[0.5px] bg-white p-[8px]">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-montserrat text-[8px] leading-[10px] text-black">Yield forecast</span>
            <div className="flex items-center gap-[5px]">
              <span className="h-0 w-[6px] border-t border-[#47802B]" />
              <span className="font-montserrat text-[6px] font-semibold leading-[7px]">Expected</span>
              <span className="h-0 w-[6px] border-t border-[#DBC771]" />
              <span className="font-montserrat text-[6px] font-semibold leading-[7px]">Ideal</span>
            </div>
          </div>
          <div className="relative h-[145px] w-full overflow-hidden">
            <div className="absolute left-0 top-[14px] flex h-[112px] w-[18px] flex-col justify-between">
              {['6.5', '6', '5.5', '4.5', '4', '3.5'].map((label) => (
                <span key={label} className="text-right font-montserrat text-[8px] leading-[10px] text-[#222222]/50">
                  {label}
                </span>
              ))}
            </div>

            <div className="absolute left-[27px] right-0 top-[16px] h-[112px]">
              {[0, 1, 2, 3, 4, 5].map((line) => (
                <div
                  key={line}
                  className="absolute left-0 right-0 h-0 border-t border-[#222222]/10"
                  style={{ top: `${line * 20}%` }}
                />
              ))}
              <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 249 112" preserveAspectRatio="none">
                <line x1="0" y1="50" x2="249" y2="50" stroke="#C2B165" strokeWidth="1" strokeDasharray="3 2" />
                <line x1="78" y1="0" x2="78" y2="112" stroke="#47802B" strokeWidth="0.8" strokeDasharray="3 2" />
                <path
                  d="M0 94 C18 58 45 58 78 78 C111 98 129 75 151 55 C176 32 204 54 222 62 C238 69 245 60 249 50"
                  fill="none"
                  stroke="#47802B"
                  strokeOpacity="0.75"
                  strokeWidth="1.2"
                />
                <circle cx="78" cy="78" r="3" fill="white" stroke="#47802B" strokeWidth="1" />
              </svg>
            </div>

            <div className="absolute bottom-0 left-[27px] right-0 flex justify-between">
              {['June', 'June', 'July', 'July', 'Oct', 'Oct'].map((label, index) => (
                <span key={`${label}-${index}`} className="font-montserrat text-[8px] leading-[10px] text-[#222222]/50">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="h-0 w-full border-t border-black/20" />

        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center justify-between">
            <span className="font-montserrat text-[8px] leading-[10px] text-[#222222]/60">Expenses</span>
            <div className="flex items-center gap-[5px]">
              <span className="h-0 w-[6px] border-t-2 border-[#DAE6D5]" />
              <span className="font-montserrat text-[6px] font-semibold leading-[7px]">Estimation</span>
              <span className="h-0 w-[6px] border-t-2 border-[#47802B]" />
              <span className="font-montserrat text-[6px] font-semibold leading-[7px]">Consumed</span>
            </div>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-[30px] bg-[#47802B]/20">
            <div className="h-4 w-12 rounded-[30px] bg-[#47802B]" />
            <span className="absolute left-[6px] top-[3px] font-montserrat text-[8px] font-medium leading-[10px] tracking-[0.04em] text-white">12,000</span>
            <span className="absolute right-[6px] top-[3px] font-montserrat text-[8px] font-medium leading-[10px] tracking-[0.04em] text-[#47802B]">254610 inr</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={goToPortfolio}
        className="absolute bottom-2 left-[13px] flex h-[23px] w-[122px] items-center justify-center rounded-[6px] bg-[#C6D8BD] px-5"
      >
        <span className="font-montserrat text-[10px] font-medium leading-[130%] text-[#2B4D1A]">Historic crop</span>
      </button>
      <button
        type="button"
        onClick={goToPortfolio}
        className="absolute bottom-2 right-2 flex h-[23px] w-[160px] items-center justify-center rounded-[6px] bg-[#356020] px-5"
      >
        <span className="font-montserrat text-[10px] font-medium leading-[130%] text-white">Explore finance options</span>
      </button>
    </div>
  );
}
