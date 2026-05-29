import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FertilizerCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function StepperField({ value }: { value: string }) {
  return (
    <div className="flex h-[30px] items-center justify-between rounded-[8px] bg-[#F4F7FA] px-[12px]">
      <span className="font-poppins text-[12px] text-[#1E1E1E]">{value}</span>
      <span className="flex flex-col gap-[2px]">
        <ChevronUp className="h-[10px] w-[10px] text-[#203A13]" strokeWidth={3} />
        <ChevronDown className="h-[10px] w-[10px] text-[#203A13]" strokeWidth={3} />
      </span>
    </div>
  );
}

export function FertilizerCalculatorModal({ isOpen, onClose }: FertilizerCalculatorModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/20 p-3 sm:p-4">
      <div className="relative max-h-[calc(100dvh-24px)] w-full max-w-[559px] overflow-y-auto rounded-[20px] bg-white pb-[64px] font-montserrat sm:h-[491px] sm:overflow-hidden sm:pb-0">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[9.47px] top-[14px] text-[#203A13] transition-opacity hover:opacity-70"
          aria-label="Close fertilizer calculator"
        >
          <X className="h-[24px] w-[24px]" strokeWidth={1.8} />
        </button>

        <div className="px-[19px] pt-[14px]">
          <h2 className="text-[18px] font-medium leading-[130%] text-black">Fertilizer Calculator</h2>

          <div className="mt-[22px] flex flex-wrap items-end gap-[16px] sm:gap-[30px]">
            <div className="w-full max-w-[194px]">
              <label className="mb-[5px] block text-[10px] font-medium leading-[130%] text-black/50">Growth Stage</label>
              <button className="flex h-[26px] w-full items-center justify-between rounded-[6px] bg-[#C6D8BD] px-[10px] text-[#203A13]">
                <span className="text-[12px] font-medium leading-[130%]">Sowing</span>
                <ChevronDown className="h-[14px] w-[14px]" strokeWidth={2} />
              </button>
            </div>

            <div className="flex h-[36px] w-[107px] items-center rounded-[10px] bg-[#EDF2EA] p-[3px] pr-[10px]">
              <div className="flex h-[30px] w-[38px] items-center justify-center rounded-[8px] bg-[#F4F7FA]">
                <span className="font-poppins text-[12px] text-[#1E1E1E]">1.0</span>
              </div>
              <span className="ml-[8px] text-[12px] font-medium leading-[130%] text-black">Acre</span>
              <ChevronDown className="ml-auto h-[14px] w-[14px] text-black" strokeWidth={2} />
            </div>
          </div>

          <h3 className="mt-[32px] text-[12px] font-medium leading-[130%] text-black">Nutrients Recommended</h3>

          <div className="mt-[3px] flex min-h-[79px] w-full items-center rounded-[9px] border border-[#DADADA] px-[17px]">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="w-full sm:w-[141px]">
                <div className="mb-[3px] text-[12px] font-medium leading-[130%] text-black">Nitrogen N</div>
                <StepperField value="100 KG" />
              </div>
              <div className="w-full sm:w-[141px]">
                <div className="mb-[3px] text-[12px] font-medium leading-[130%] text-black">Phosphorus P₂O₅</div>
                <StepperField value="50 KG" />
              </div>
              <div className="w-full sm:w-[141px]">
                <div className="mb-[3px] text-[12px] font-medium leading-[130%] text-black">Potassium K₂O</div>
                <StepperField value="50 KG" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[32px] px-[19px]">
          <h3 className="text-[12px] font-medium leading-[130%] text-black">Fertilizers Required</h3>

          <div className="mt-[20px] w-full overflow-x-auto">
            <div className="grid min-w-[420px] grid-cols-[119px_90px_1fr] border-b border-black/20 pb-[6px] pl-[21px] text-[10px] font-medium leading-[130%] text-black/50">
              <span>Fertilizers</span>
              <span>Quantity</span>
              <span>Nutrients contents</span>
            </div>

            {[
              ['Urea', '217 KG', 'Contains 46% Nitrogen'],
              ['DAP', '109 KG', 'Contains 18% Nitrogen + 46 % Phosphorus'],
              ['MOP', '83 KG', 'Contains 60% Potassium'],
            ].map(([name, quantity, content], i, arr) => (
              <div
                key={name}
                className={`grid h-[38px] min-w-[420px] grid-cols-[119px_90px_1fr] items-center pl-[21px] text-[12px] leading-[130%] ${
                  i !== arr.length - 1 ? 'border-b border-black/20' : ''
                }`}
              >
                <span className="font-medium text-black">{name}</span>
                <span className="font-poppins text-[#1E1E1E]">{quantity}</span>
                <span className="text-[10px] font-medium text-[#1E1E1E]">{content}</span>
              </div>
            ))}
            <div className="border-t border-black/20" />
          </div>

          <div className="absolute bottom-[15px] left-[20px] right-[20px] flex flex-wrap justify-end gap-[8px]">
            <button
              type="button"
              className="flex h-[26px] w-[110px] items-center justify-center rounded-[6px] bg-[#E3ECDF] text-[12px] font-medium leading-[130%] text-[#203A13] transition-opacity hover:opacity-80"
            >
              Clear
            </button>
            <button
              type="button"
              className="flex h-[26px] w-[147px] items-center justify-center rounded-[6px] bg-[#356020] text-[12px] font-medium leading-[130%] text-white transition-opacity hover:opacity-80"
            >
              Shop Fertilizers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
