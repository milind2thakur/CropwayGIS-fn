import { ChevronDown, ChevronUp, X } from 'lucide-react';
import Link from 'next/link';

interface FertilizerCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function StepperField({ value }: { value: string }) {
  return (
    <div className="flex h-[60px] items-center justify-between rounded-[14px] bg-[#F4F7FA] px-[24px]">
      <span className="font-montserrat text-[24px] font-medium leading-[130%] text-[#1E1E1E]">{value}</span>
      <span className="flex flex-col">
        <ChevronUp className="h-[22px] w-[22px] text-[#203A13]" strokeWidth={2} />
        <ChevronDown className="h-[22px] w-[22px] text-[#203A13]" strokeWidth={2} />
      </span>
    </div>
  );
}

export function FertilizerCalculatorModal({ isOpen, onClose }: FertilizerCalculatorModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4">
      <div className="relative h-[min(980px,calc(100vh-32px))] w-[min(1118px,calc(100vw-32px))] overflow-auto rounded-[32px] bg-white font-montserrat">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[34px] top-[34px] text-[#203A13] transition-opacity hover:opacity-70"
          aria-label="Close fertilizer calculator"
        >
          <X className="h-[36px] w-[36px]" strokeWidth={1.8} />
        </button>

        <div className="px-[38px] pt-[28px]">
          <h2 className="text-[38px] font-medium leading-[130%] text-black">Fertilizer Calculator</h2>

          <div className="mt-[32px] flex items-end gap-[60px]">
            <div className="w-[388px]">
              <label className="mb-[10px] block text-[20px] font-medium leading-[130%] text-black/50">Growth Stage</label>
              <button className="flex h-[52px] w-full items-center justify-between rounded-[10px] bg-[#C6D8BD] px-[20px] text-[#203A13]">
                <span className="text-[24px] font-medium leading-[130%]">Sowing</span>
                <ChevronDown className="h-[28px] w-[28px]" strokeWidth={2} />
              </button>
            </div>

            <div className="flex h-[72px] items-center rounded-[18px] bg-[#EDF2EA] p-[6px] pr-[18px]">
              <div className="grid h-[60px] w-[77px] place-items-center rounded-[14px] bg-[#F4F7FA]">
                <span className="text-[24px] font-medium leading-[130%] text-[#1E1E1E]">1.0</span>
              </div>
              <span className="ml-[20px] text-[26px] font-medium leading-[130%] text-black">Acre</span>
              <ChevronDown className="ml-[16px] h-[28px] w-[28px] text-[#203A13]" strokeWidth={2} />
            </div>
          </div>

          <h3 className="mt-[64px] text-[28px] font-medium leading-[130%] text-black">Nutrients Recommended</h3>

          <div className="mt-[6px] rounded-[18px] border border-[#DADADA] px-[32px] py-[28px]">
            <div className="grid grid-cols-3 gap-[60px]">
              <div>
                <div className="mb-[8px] text-[26px] font-medium leading-[130%] text-black">Nitrogen N</div>
                <StepperField value="100 KG" />
              </div>
              <div>
                <div className="mb-[8px] text-[26px] font-medium leading-[130%] text-black">Phosphorus P₂O₅</div>
                <StepperField value="50 KG" />
              </div>
              <div>
                <div className="mb-[8px] text-[26px] font-medium leading-[130%] text-black">Potassium K₂O</div>
                <StepperField value="50 KG" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[32px] border-t border-black/20 px-[38px] pt-[30px]">
          <h3 className="text-[28px] font-medium leading-[130%] text-black">Fertilizers Required</h3>

          <div className="mx-auto mt-[34px] w-[88%]">
            <div className="grid grid-cols-[1fr_180px_1.9fr] border-b border-black/20 pb-[10px] text-[20px] font-medium leading-[130%] text-black/50">
              <span>Fertilizers</span>
              <span>Quantity</span>
              <span>Nutrients contents</span>
            </div>

            {[
              ['Urea', '217 KG', 'Contains 46% Nitrogen'],
              ['DAP', '109 KG', 'Contains 18% Nitrogen + 46 % Phosphorus'],
              ['MOP', '83 KG', 'Contains 60% Potassium'],
            ].map(([name, quantity, content]) => (
              <div key={name} className="grid grid-cols-[1fr_180px_1.9fr] border-b border-black/20 py-[18px] text-[24px] font-medium leading-[130%] text-[#1E1E1E]">
                <span>{name}</span>
                <span>{quantity}</span>
                <span className="text-[22px]">{content}</span>
              </div>
            ))}
          </div>

          <div className="mt-[42px] flex justify-end gap-[16px]">
            <button
              type="button"
              className="flex h-[52px] w-[220px] items-center justify-center rounded-[10px] bg-[#E3ECDF] text-[26px] font-medium leading-[130%] text-[#203A13] transition-opacity hover:opacity-80"
            >
              Clear
            </button>
            <Link
              href="/crop-planning"
              className="flex h-[52px] w-[294px] items-center justify-center rounded-[10px] bg-[#356020] text-[26px] font-medium leading-[130%] text-white transition-opacity hover:opacity-80"
            >
              Shop Fertilizers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
