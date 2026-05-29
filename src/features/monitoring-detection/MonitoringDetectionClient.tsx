'use client';

/* eslint-disable @next/next/no-img-element */

import { AlertTriangle, ArrowRight, Check, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { FertilizerCalculatorModal } from './FertilizerCalculatorModal';

type TaskStatus = 'Completed' | 'Pending' | 'Ongoing' | 'Empty';

type CalendarTask = {
  day: string;
  title?: string;
  subtitle?: string;
  status: TaskStatus;
  actionKey?: string;
};

type BoundingBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
};

type Product = {
  name: string;
  price: string;
  size: string;
};

type DetectionResult = {
  id: number;
  crop_type: string;
  disease_name: string;
  category: string;
  severity: string;
  description: string;
  treatment: string;
  dosage: string;
  confidence: number;
  bboxes: BoundingBox[];
  products: Product[];
};

function MoreDots({ light = false, onClick }: { light?: boolean; onClick?: () => void }) {
  if (onClick) {
    return (
      <button
        type="button"
        className="absolute right-[7px] top-[9px] z-10 flex h-[12px] w-[10px] items-center justify-center rounded hover:bg-black/5"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        aria-label="Task actions"
      >
        <span className="flex flex-col gap-[2px] opacity-80" aria-hidden="true">
          <span className={cn('h-[2px] w-[2px] rounded-full', light ? 'bg-white' : 'bg-[#222222]')} />
          <span className={cn('h-[2px] w-[2px] rounded-full', light ? 'bg-white' : 'bg-[#222222]')} />
          <span className={cn('h-[2px] w-[2px] rounded-full', light ? 'bg-white' : 'bg-[#222222]')} />
        </span>
      </button>
    );
  }

  return (
    <span className="absolute right-[7px] top-[9px] flex flex-col gap-[2px] opacity-80" aria-hidden="true">
      <span className={cn('h-[2px] w-[2px] rounded-full', light ? 'bg-white' : 'bg-[#222222]')} />
      <span className={cn('h-[2px] w-[2px] rounded-full', light ? 'bg-white' : 'bg-[#222222]')} />
      <span className={cn('h-[2px] w-[2px] rounded-full', light ? 'bg-white' : 'bg-[#222222]')} />
    </span>
  );
}

function TaskActionMenu({
  title,
  onComplete,
  onSecondary,
}: {
  title: string;
  onComplete: () => void;
  onSecondary?: () => void;
}) {
  const isFertilizer = title.toLowerCase().includes('fertilizer');
  const secondaryLabel = isFertilizer ? 'Calculate Cost' : 'Know More';

  return (
    <div
      className={cn(
        'absolute z-30 h-[46px] rounded-[10px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]',
        isFertilizer ? 'left-[30px] top-[12px] w-[91px]' : 'left-[42px] top-[19px] w-[78px]',
      )}
    >
      <button
        type="button"
        className={cn(
          'absolute left-[8px] top-[5px] flex h-[15px] items-center gap-[2px] font-montserrat text-[8px] font-normal leading-[10px] text-[#222222] hover:bg-black/5',
          isFertilizer ? 'w-[75px] justify-between' : 'w-[62px]',
        )}
        onClick={(event) => {
          event.stopPropagation();
          onComplete();
        }}
      >
        Completed
        <Check className="h-[15px] w-[15px]" strokeWidth={1.6} />
      </button>
      <button
        type="button"
        className={cn(
          'absolute left-[8px] top-[24px] flex h-[15px] items-center gap-[2px] font-montserrat text-[8px] font-normal leading-[10px] text-[#222222] hover:bg-black/5',
          isFertilizer ? 'w-[75px] justify-between' : 'w-[63px]',
        )}
        onClick={(event) => {
          event.stopPropagation();
          onSecondary?.();
        }}
      >
        {secondaryLabel}
        <ArrowRight className="h-[15px] w-[15px]" strokeWidth={1.6} />
      </button>
    </div>
  );
}

function CalendarCard({
  task,
  menuOpen,
  onToggleMenu,
  onComplete,
  onSecondary,
}: {
  task: CalendarTask;
  menuOpen?: boolean;
  onToggleMenu?: () => void;
  onComplete?: () => void;
  onSecondary?: () => void;
}) {
  if (task.status === 'Empty') {
    return (
      <div className="relative h-[69px] w-[114px] rounded-[10px] border border-black/10 bg-[#F2F2F2]">
        <MoreDots />
        <span className="absolute bottom-[7px] right-[9px] font-montserrat text-[10px] font-medium leading-[13px] text-black">{task.day}</span>
      </div>
    );
  }

  const isOngoing = task.status === 'Ongoing';
  const statusClass = {
    Completed: 'bg-[#E3ECDF]',
    Pending: 'bg-[#FBF4D7]',
    Ongoing: 'bg-[#407327]',
    Empty: '',
  }[task.status];

  return (
    <div className={cn('relative h-[69px] w-[114px] rounded-[10px] border border-black/10 p-0', statusClass)}>
      <MoreDots light={isOngoing} onClick={onToggleMenu} />
      <div className={cn('absolute left-[9px] top-[11px] max-w-[84px] font-montserrat text-[8px] font-normal leading-[10px]', isOngoing ? 'text-white' : 'text-[#222222]')}>
        <div>{task.title}</div>
        {task.subtitle ? <div className="whitespace-pre-line">{task.subtitle}</div> : null}
      </div>
      <span className={cn('absolute left-[9px] top-[51px] font-montserrat text-[8px] font-bold leading-[10px]', isOngoing ? 'text-white' : task.status === 'Completed' ? 'text-[#2B4D1A]' : 'text-[#6D6339]')}>
        {task.status === 'Completed' ? 'Complete' : task.status}
      </span>
      <span className={cn('absolute left-[94px] top-[49px] font-montserrat text-[10px] font-medium leading-[13px]', isOngoing ? 'text-white' : 'text-black')}>
        {task.day}
      </span>
      {menuOpen && task.actionKey ? (
        <TaskActionMenu
          title={task.title || ''}
          onComplete={onComplete ?? (() => undefined)}
          onSecondary={onSecondary}
        />
      ) : null}
    </div>
  );
}

function TaskCalendar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<string>>(() => new Set());
  const [fertilizerModalOpen, setFertilizerModalOpen] = useState(false);
  const rawTasks: Omit<CalendarTask, 'actionKey'>[] = [
    { title: 'Ploughing', status: 'Completed', day: '01' },
    { title: 'Ploughing', status: 'Pending', day: '02' },
    { title: 'Ploughing', status: 'Completed', day: '03' },
    { title: 'Ploughing', status: 'Completed', day: '04' },
    { title: 'Harrowing', status: 'Pending', day: '05' },
    { title: 'Harrowing', status: 'Completed', day: '06' },
    { title: 'Harrowing', status: 'Completed', day: '07' },
    { title: 'Leveling', status: 'Pending', day: '09' },
    { title: 'Leveling', status: 'Completed', day: '09' },
    { title: 'Organic manure', subtitle: 'Fertilizers (NPK)\nBiofertilizers', status: 'Pending', day: '10' },
    { title: 'Organic manure', subtitle: 'Fertilizers (NPK)\nBiofertilizers', status: 'Completed', day: '11' },
    { title: 'Organic manure', subtitle: 'Fertilizers (NPK)\nBiofertilizers', status: 'Completed', day: '12' },
    { title: 'Irrigation', status: 'Pending', day: '13' },
    { title: 'Irrigation', status: 'Completed', day: '14' },
    { title: 'Sowing', status: 'Pending', day: '15' },
    { title: 'Sowing', status: 'Completed', day: '16' },
    { title: 'Sowing', status: 'Completed', day: '17' },
    { title: 'Fertilizer Application', status: 'Pending', day: '18' },
    { title: 'Fertilizer Application', status: 'Ongoing', day: '19' },
    { status: 'Empty', day: '20' },
    { status: 'Empty', day: '21' },
    { status: 'Empty', day: '22' },
    { status: 'Empty', day: '23' },
    { status: 'Empty', day: '24' },
    { status: 'Empty', day: '25' },
    { status: 'Empty', day: '26' },
    { status: 'Empty', day: '27' },
    { status: 'Empty', day: '28' },
    { status: 'Empty', day: '29' },
    { status: 'Empty', day: '30' },
    { status: 'Empty', day: '31' },
  ];

  const tasks: CalendarTask[] = rawTasks.map((t, i) => {
    if (t.status === 'Empty') return t as CalendarTask;
    const actionKey = `${t.title}-${t.day}-${i}`;
    return {
      ...t,
      actionKey,
      status: completedActions.has(actionKey) ? 'Completed' : t.status,
    };
  });

  return (
    <section className="rounded-[20px] bg-white px-2 pb-[28px] pt-[20px] lg:px-2">
      <div className="mb-[26px] flex items-center justify-between px-[24px]">
        <h1 className="font-montserrat text-[18px] font-medium leading-[130%] text-black">Task Calender</h1>
        <button className="flex h-[36px] items-center gap-3 rounded-[7px] bg-[#2B4D1A] px-[14px] font-montserrat text-[14px] font-medium text-white">
          Add Task
          <span className="grid h-[13px] w-[13px] place-items-center rounded-full bg-white/20">
            <Plus className="h-[9px] w-[9px]" />
          </span>
        </button>
      </div>

      <div className="grid h-[58px] grid-cols-7 items-center bg-[#E9F2FF] font-montserrat text-[14px] font-medium text-black">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center">{day}</div>
        ))}
      </div>

      <div className="px-[4px] pt-[10px]">
        <div className="mb-[8px] px-[24px] font-montserrat text-[16px] font-medium text-black">May</div>
        <div className="grid grid-cols-[repeat(7,minmax(96px,114px))] justify-between gap-y-[10px] overflow-x-auto pb-2">
          {tasks.map((task, index) => (
            <CalendarCard
              key={`${task.day}-${index}`}
              task={task}
              menuOpen={task.actionKey === openMenu}
              onToggleMenu={task.actionKey ? () => setOpenMenu((current) => (current === task.actionKey ? null : task.actionKey ?? null)) : undefined}
              onComplete={() => {
                if (!task.actionKey) {
                  return;
                }
                setCompletedActions((current) => new Set(current).add(task.actionKey));
                setOpenMenu(null);
              }}
              onSecondary={() => {
                setOpenMenu(null);
                if (task.title?.toLowerCase().includes('fertilizer')) {
                  setFertilizerModalOpen(true);
                }
              }}
            />
          ))}
        </div>

        <div className="mt-[18px] flex justify-end gap-[28px] pr-[8px]">
          <Legend color="#407327" label="Present Day" />
          <Legend color="#FBF4D7" label="Pending" />
          <Legend color="#E3ECDF" label="Completed" />
        </div>
      </div>
      <FertilizerCalculatorModal isOpen={fertilizerModalOpen} onClose={() => setFertilizerModalOpen(false)} />
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[7px]">
      <span className="h-[14px] w-[25px] rounded-full" style={{ backgroundColor: color }} />
      <span className="font-montserrat text-[12px] font-medium text-black">{label}</span>
    </div>
  );
}

function Backlogs() {
  const items: CalendarTask[] = [
    { title: 'Ploughing', subtitle: '14 days', status: 'Pending', day: '02' },
    { title: 'Harrowing', subtitle: '12 days', status: 'Pending', day: '05' },
    { title: 'Leveling', subtitle: '8 days', status: 'Pending', day: '08' },
    { title: 'Organic manure', subtitle: 'Fertilizers (NPK)\nBiofertilizers\n7 days', status: 'Pending', day: '10' },
    { title: 'Irrigation', subtitle: '4 days', status: 'Pending', day: '13' },
    { title: 'Irrigation', subtitle: '3 days', status: 'Pending', day: '15' },
    { title: 'Fertilizer Application', subtitle: '1 day', status: 'Pending', day: '18' },
  ];

  return (
    <section className="border-t border-black/10 bg-white px-[28px] pt-[14px]">
      <h2 className="mb-[12px] font-montserrat text-[16px] font-medium text-black">Backlogs</h2>
      <div className="grid grid-cols-[repeat(7,minmax(96px,114px))] justify-between gap-y-[10px] overflow-x-auto pb-2">
        {items.map((task, index) => (
          <CalendarCard key={`${task.day}-${index}`} task={task} />
        ))}
      </div>
    </section>
  );
}

function MoleculeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="#222222" strokeWidth="1.5" />
      <circle cx="17" cy="3" r="2" stroke="#222222" strokeWidth="1.5" />
      <circle cx="15" cy="17" r="2" stroke="#222222" strokeWidth="1.5" />
      <circle cx="20" cy="10" r="2" stroke="#222222" strokeWidth="1.5" />
      <circle cx="4" cy="4" r="2" stroke="#222222" strokeWidth="1.5" />
      <circle cx="3" cy="17" r="2" stroke="#222222" strokeWidth="1.5" />
      <line x1="14.5" y1="9.5" x2="15.5" y2="4.5" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14.5" y1="14" x2="13.5" y2="15.5" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="11.5" x2="18" y2="10.5" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9.5" y1="9.5" x2="5.5" y2="5.5" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9.5" y1="14" x2="4.5" y2="15.5" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" aria-hidden="true">
      <rect x="17" y="17" width="34" height="34" rx="8" stroke="#222222" strokeWidth="1.4" />
      <path d="M19 39L26 31.5C28.2 29.1 31.1 29.5 32.8 32.4L36.2 38.3C37.7 40.8 39.8 41 41.7 38.8L49 31" stroke="#222222" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="45.5" cy="23.5" r="3.5" fill="#222222" />
    </svg>
  );
}

function DiseaseDetectionCard({
  selectedCrop,
  onCropChange,
  onImageUpload,
}: {
  selectedCrop: string;
  onCropChange: (crop: string) => void;
  onImageUpload: (file: File) => void;
}) {
  const crops = useMemo(() => ['Crop name', 'Tomato', 'Rice', 'Barley', 'Wheat'], []);

  return (
    <section className="rounded-[20px] bg-white p-[16px]">
      <div className="mb-[24px] flex items-center gap-[12px]">
        <MoleculeIcon />
        <h2 className="font-montserrat text-[18px] font-medium leading-[130%] text-black">Disease Detection</h2>
      </div>

      <div className="rounded-[21px] border border-dashed border-[#407327] bg-[#EDF2EA] px-[32px] py-[28px]">
        <select
          value={selectedCrop}
          onChange={(event) => onCropChange(event.target.value)}
          className="mb-[20px] h-[34px] w-full rounded-[6px] border-none bg-[#356020] px-[12px] font-montserrat text-[12px] font-medium text-white outline-none"
        >
          {crops.map((crop) => (
            <option key={crop}>{crop}</option>
          ))}
        </select>

        <label className={cn('block', selectedCrop === 'Crop name' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer')}>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="sr-only"
            disabled={selectedCrop === 'Crop name'}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file && selectedCrop !== 'Crop name') {
                onImageUpload(file);
              }
            }}
          />
          <div className="flex h-[146px] items-center justify-center rounded-[21px] bg-[#C6D8BD]">
            <ImagePlaceholderIcon />
          </div>
        </label>

        <div className="mt-[6px] text-center">
          <div className="font-montserrat text-[18px] font-medium leading-[130%] text-black">Upload image of leaf</div>
          <div className="mt-[5px] font-montserrat text-[12px] font-medium leading-[130%] text-black/50">file type: png, jpg, jpeg</div>
          <div className="font-montserrat text-[12px] font-medium leading-[130%] text-black/50">less then 1024kb</div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ name }: { name: string }) {
  return (
    <div className="relative h-[145px] w-[223px] rounded-[10px] bg-[#EDF2EA]">
      <div className="absolute left-[14px] top-[12px] font-montserrat text-[16px] font-medium leading-[130%] text-[#1E1E1E]">{name}</div>
      <div className="absolute left-[14px] top-[37px] font-montserrat text-[12px] font-medium leading-[130%] text-[#1E1E1E]/70">100gm</div>
      <div className="absolute left-[14px] top-[85px] font-montserrat text-[14px] font-medium leading-[130%] text-[#1E1E1E]">₹-196</div>
      <button className="absolute left-[14px] top-[112px] flex h-[26px] w-[107px] items-center justify-center gap-[10px] rounded-[6px] bg-[#356020] px-[10px] font-montserrat text-[12px] font-medium leading-[130%] text-white">
        Add to cart
        <Plus className="h-[8px] w-[8px]" />
      </button>
      <ProductPacket className="absolute left-[142px] top-[14px]" />
    </div>
  );
}

function ProductPacket({ className }: { className?: string }) {
  return (
    <svg width="73" height="116" viewBox="0 0 73 116" fill="none" className={className} aria-hidden="true">
      <g filter="url(#product-packet-shadow)">
        <path d="M0 6.0834H73C64.998 40.0912 64.998 75.492 73 109.5H0C8.002 75.492 8.002 40.0912 0 6.0834Z" fill="#D9D9D9" />
      </g>
      {Array.from({ length: 10 }).map((_, index) => {
        const x = index * 7.3;
        return <path key={`top-${index}`} d={`M${x + 3.65} 0L${x + 7.3} 2.4333H${x}L${x + 3.65} 0Z`} fill="#D9D9D9" />;
      })}
      {Array.from({ length: 10 }).map((_, index) => {
        const x = index * 7.3;
        return <path key={`bottom-${index}`} d={`M${x + 3.65} 115.583L${x + 7.3} 113.15H${x}L${x + 3.65} 115.583Z`} fill="#D9D9D9" />;
      })}
      <rect y="2.4333" width="73" height="3.65" fill="#D9D9D9" />
      <rect y="109.5" width="73" height="3.65" fill="#D9D9D9" />
      <path
        d="M36.5 34.5667C46.975 34.5667 55.467 43.0585 55.467 53.5334C55.467 64.008 46.975 72.5 36.5 72.5C26.025 72.5 17.534 64.008 17.533 53.5334C17.533 43.0584 26.025 34.5667 36.5 34.5667ZM40.973 55.3303C40.356 55.3038 39.757 55.3435 39.277 55.5159C38.796 55.6884 38.308 56.0388 37.849 56.4514C37.382 56.8703 36.911 57.3841 36.464 57.9221C35.569 58.9985 34.742 60.2058 34.204 61.0305C33.689 61.8217 34.064 62.8693 34.965 63.1526C35.904 63.4478 37.311 63.8542 38.686 64.116C39.373 64.247 40.063 64.344 40.69 64.371C41.306 64.398 41.905 64.359 42.386 64.187C42.867 64.014 43.354 63.6629 43.814 63.2502C44.28 62.8314 44.751 62.3184 45.198 61.7805C46.093 60.7041 46.921 59.4958 47.458 58.6711C47.974 57.88 47.598 56.8334 46.698 56.55C45.759 56.2549 44.352 55.8474 42.977 55.5852C42.29 55.4542 41.599 55.3573 40.973 55.3303ZM25.555 46.7698C24.622 46.7049 23.892 47.5277 24.067 48.4465C24.251 49.415 24.56 50.8579 24.983 52.2043C25.194 52.8774 25.437 53.5373 25.712 54.1057C25.983 54.6655 26.305 55.1782 26.69 55.5198C27.074 55.8614 27.621 56.1204 28.209 56.3235C28.806 56.5297 29.49 56.693 30.183 56.8235C31.57 57.0845 33.04 57.2209 34.024 57.2893C34.957 57.3541 35.687 56.5323 35.512 55.6135C35.328 54.645 35.019 53.2015 34.596 51.8547C34.385 51.1816 34.142 50.5219 33.866 49.9534C33.595 49.3936 33.274 48.8809 32.889 48.5393C32.504 48.1978 31.957 47.9396 31.369 47.7366C30.772 47.5304 30.089 47.3661 29.396 47.2356C28.009 46.9746 26.538 46.8382 25.555 46.7698ZM45.894 42.3655C44.919 42.4991 43.474 42.7318 42.118 43.0813C41.441 43.256 40.775 43.4625 40.198 43.7053C39.628 43.9445 39.103 44.2357 38.741 44.5969C38.38 44.9581 38.088 45.4829 37.849 46.052C37.606 46.6299 37.399 47.2955 37.224 47.9729C36.874 49.3282 36.641 50.7732 36.507 51.7483C36.378 52.6838 37.165 53.4712 38.101 53.343C39.076 53.2094 40.521 52.9767 41.876 52.6272C42.554 52.4525 43.22 52.246 43.798 52.0032C44.367 51.764 44.892 51.4727 45.253 51.1116C45.615 50.7504 45.906 50.2257 46.146 49.6565C46.389 49.0786 46.596 48.413 46.771 47.7356C47.121 46.3804 47.353 44.9353 47.488 43.9602C47.616 43.0246 46.829 42.2372 45.894 42.3655Z"
        fill="#2B4D1A"
      />
      <defs>
        <filter id="product-packet-shadow" x="-3" y="2.0834" width="79" height="111.417" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="-3" dy="-4" />
          <feGaussianBlur stdDeviation="7" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="3" dy="4" />
          <feGaussianBlur stdDeviation="7" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
          <feBlend mode="normal" in2="effect1_innerShadow" result="effect2_innerShadow" />
        </filter>
      </defs>
    </svg>
  );
}

function DetectionResultPage({
  result,
  imageUrl,
  onClear,
}: {
  result: DetectionResult;
  imageUrl: string;
  onClear: () => void;
}) {
  const severityColorClass = {
    Low: 'bg-[#E3ECDF] text-[#2B4D1A]',
    Moderate: 'bg-[#FBF4D7] text-black',
    High: 'bg-[#FDD8D8] text-[#D32F2F]',
    Healthy: 'bg-[#E3ECDF] text-[#2B4D1A]',
  }[result.severity] ?? 'bg-[#FBF4D7] text-black';

  const severityDotClass = {
    Low: 'bg-[#407327]',
    Moderate: 'bg-[#F4D867]',
    High: 'bg-[#D32F2F]',
    Healthy: 'bg-[#407327]',
  }[result.severity] ?? 'bg-[#F4D867]';

  return (
    <div className="relative min-h-screen bg-[#F2F2F2] pb-10">
      <div className="h-[238px] bg-[#2B4D1A]" />
      <div className="relative -mt-[210px] px-[18px]">
        <h1 className="mb-[28px] ml-[26px] font-montserrat text-[38px] font-medium leading-[130%] text-white">Monitoring &amp; Detection</h1>

        <section className="rounded-[20px] bg-white px-[22px] py-[16px]">
          <div className="mb-[24px] flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <MoleculeIcon />
              <h2 className="font-montserrat text-[20px] font-medium leading-[130%] text-black">Disease Detection</h2>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="flex h-[44px] items-center gap-[14px] rounded-[8px] bg-[#C6D8BD] px-[14px] font-montserrat text-[18px] font-medium text-[#203A13]"
            >
              Clear
              <Trash2 className="h-[24px] w-[24px]" strokeWidth={1.8} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[minmax(320px,510px)_1fr]">
            <div>
              <div className="relative h-[412px] overflow-hidden rounded-[20px] bg-[#C6D8BD]">
                <img src={imageUrl} alt="Uploaded diseased leaf" className="h-full w-full object-cover" />
                {result.bboxes.map((box, i) => (
                  <div
                    key={i}
                    className="absolute border-[4px] border-[#51D117] rounded-[8px] flex items-start"
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                    }}
                  >
                    <span className="bg-[#51D117] text-black font-montserrat text-[9px] font-bold px-1 rounded-br whitespace-nowrap">
                      {box.label} ({Math.round(box.confidence * 100)}%)
                    </span>
                  </div>
                ))}
              </div>

              {result.products.length > 0 && (
                <>
                  <h3 className="mt-[28px] font-montserrat text-[20px] font-medium leading-[130%] text-black">Featured Products</h3>
                  <div className="mt-[4px] flex gap-[7px] overflow-x-auto pb-2">
                    {result.products.map((p, i) => (
                      <ProductCard key={i} name={p.name} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="pt-[20px] font-montserrat">
              <div className="mb-[18px] inline-flex rounded-[10px] bg-[#EDF2EA] px-[14px] py-[8px] text-[24px] font-medium text-black">
                {result.crop_type}
              </div>
              <div className="mb-[18px] flex items-center gap-[18px] text-[18px]">
                <span className="font-medium text-black/50">Detected Disease:</span>
                <span className="font-bold text-[#2B4D1A]">
                  {result.disease_name}
                  {result.category !== 'None' && <span className="font-medium">({result.category})</span>}
                </span>
              </div>
              <div className={`mb-[26px] inline-flex items-center gap-[18px] rounded-full px-[14px] py-[8px] ${severityColorClass}`}>
                <span className="text-[16px] font-medium opacity-60">Severity</span>
                <span className="text-[16px] font-medium">{result.severity}</span>
                <span className={`h-[12px] w-[12px] rounded-full ${severityDotClass}`} />
              </div>
              <p className="max-w-[760px] text-[19px] font-medium leading-[130%] text-black/65">
                {result.description}
              </p>
              <div className="mt-[46px] space-y-[10px] text-[18px] font-medium leading-[130%]">
                <div>
                  <span className="text-black/50">Treatment:&nbsp;</span>
                  <span className="font-bold text-[#2B4D1A]">{result.treatment}</span>
                </div>
                <div>
                  <span className="text-black/50">Dosage:&nbsp;</span>
                  <span className="text-black">{result.dosage}</span>
                </div>
              </div>
              <div className="mt-[24px] h-px max-w-[760px] bg-black/10" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DetectionProcessingPage({ selectedCrop }: { selectedCrop: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F2F2F2] pb-10">
      <div className="h-[238px] bg-[#2B4D1A]" />
      <div className="relative -mt-[210px] px-[18px]">
        <h1 className="mb-[28px] ml-[26px] font-montserrat text-[38px] font-medium leading-[130%] text-white">Monitoring &amp; Detection</h1>

        <section className="rounded-[20px] bg-white px-[20px] py-[16px]">
          <div className="mb-[26px] flex items-center gap-[12px]">
            <MoleculeIcon />
            <h2 className="font-montserrat text-[20px] font-medium leading-[130%] text-black">Disease Detection</h2>
          </div>

          <div className="rounded-[21px] border border-dashed border-[#407327] bg-[#EDF2EA] px-[20px] py-[30px]">
            <div className="mx-auto w-full max-w-[360px]">
              <div className="mb-[22px] flex h-[34px] items-center justify-between rounded-[6px] bg-[#356020] px-[12px] font-montserrat text-[12px] font-medium text-white">
                <span>{selectedCrop}</span>
                <span>⌄</span>
              </div>
              <div className="flex h-[146px] items-center justify-center rounded-[21px] bg-[#C6D8BD]">
                <ImagePlaceholderIcon />
              </div>
              <div className="mt-[6px] text-center">
                <div className="font-montserrat text-[18px] font-medium leading-[130%] text-black">Upload image of leaf</div>
                <div className="mt-[5px] font-montserrat text-[12px] font-medium leading-[130%] text-black/50">file type: png, jpg, jpeg</div>
                <div className="font-montserrat text-[12px] font-medium leading-[130%] text-black/50">less then 1024kb</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-[20px] min-h-[462px] rounded-[20px] bg-white px-[36px] py-[22px]">
          <h2 className="font-montserrat text-[20px] font-medium leading-[130%] text-black">Your Crops</h2>
          <div className="mt-[24px] grid grid-cols-1 gap-[40px] lg:grid-cols-[minmax(280px,482px)_1fr]">
            <div className="h-[360px] bg-[#EDF2EA]" />
            <div className="space-y-[14px]">
              <div className="h-[52px] w-full max-w-[780px] bg-[#EDF2EA]" />
              <div className="h-[140px] w-full max-w-[292px] bg-[#EDF2EA]" />
              <div className="h-[54px] w-full max-w-[330px] bg-[#EDF2EA]" />
            </div>
          </div>
        </section>
      </div>

      <div className="absolute inset-0 bg-black/25">
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-[12px]">
          <span className="h-[26px] w-[26px] rounded-full bg-[#EDF2EA] animate-bounce" />
          <span className="h-[26px] w-[26px] rounded-full bg-[#EDF2EA] animate-bounce delay-100" />
          <span className="h-[26px] w-[26px] rounded-full bg-[#EDF2EA] animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
}

function InfectionChance() {
  return (
    <section className="rounded-[20px] bg-white p-[20px]">
      <div className="mb-[8px] flex items-center gap-[10px]">
        <AlertTriangle className="h-[14px] w-[14px] fill-[#FFCF00] text-[#FFCF00]" />
        <h2 className="font-montserrat text-[18px] font-medium leading-[130%] text-black">Infection Chance</h2>
      </div>
      <p className="mb-[22px] max-w-[360px] font-montserrat text-[12px] font-medium leading-[130%] text-black/50">
        Infection chance show the risk of your crop getting infected by prior uploaded images and missed tasks
      </p>
      <svg viewBox="0 0 420 250" className="h-[250px] w-full" role="img" aria-label="Infection chance chart">
        <g fontFamily="Montserrat" fontSize="10" fill="#222222" opacity="0.45">
          {[100, 80, 60, 40, 20, 0].map((value, index) => (
            <text key={value} x="18" y={24 + index * 38}>{value}</text>
          ))}
        </g>
        <g stroke="#222222" strokeWidth="0.6" opacity="0.12">
          {[20, 58, 96, 134, 172, 210].map((y) => (
            <line key={y} x1="45" y1={y} x2="400" y2={y} />
          ))}
        </g>
        <line x1="45" y1="96" x2="400" y2="96" stroke="#C2B165" strokeDasharray="3 3" />
        <line x1="145" y1="20" x2="145" y2="210" stroke="#2B4D1A" strokeDasharray="3 3" opacity="0.65" />
        <path d="M45 190 C70 130 105 120 145 145 C190 172 210 158 240 120 C270 84 310 95 330 118 C355 146 383 132 400 92" fill="none" stroke="#8CB584" strokeWidth="1.6" />
        <path d="M45 190 C70 130 105 120 145 145" fill="none" stroke="#2B4D1A" strokeWidth="1.8" />
        <circle cx="145" cy="145" r="3" fill="#fff" stroke="#2B4D1A" strokeWidth="1.4" />
        <g fontFamily="Montserrat" fontSize="10" fill="#222222" opacity="0.45" textAnchor="middle">
          <text x="62" y="232">June</text>
          <text x="142" y="232">June</text>
          <text x="222" y="232">July</text>
          <text x="302" y="232">July</text>
          <text x="365" y="232">Oct</text>
          <text x="405" y="232">Oct</text>
        </g>
        <text x="10" y="135" transform="rotate(-90 10 135)" fontFamily="Montserrat" fontSize="10" fill="#222222" opacity="0.45">in % (percentage)</text>
      </svg>
    </section>
  );
}

export function MonitoringDetectionClient() {
  const router = useRouter();
  const [fertilizerModalOpen, setFertilizerModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Crop name');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isProcessingDetection, setIsProcessingDetection] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);

  const handleImageUpload = async (file: File) => {
    if (selectedCrop === 'Crop name') return;

    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setUploadedImageUrl(localUrl);
    setIsProcessingDetection(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('crop_type', selectedCrop);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';
      const response = await fetch(`${apiBaseUrl}/api/v1/disease/detect/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Detection request failed');
      }

      const result = await response.json() as DetectionResult;
      setDetectionResult(result);
    } catch (err) {
      console.error('API Error, falling back to mock:', err);
      
      // Fallback mocks if Django backend is offline
      const mockResult: DetectionResult = {
        id: 0,
        crop_type: selectedCrop,
        disease_name: selectedCrop.toLowerCase() === 'wheat' ? 'Leaf Rust' : selectedCrop.toLowerCase() === 'rice' ? 'Rice Blast' : 'Leaf Spot',
        category: 'Fungal Disease',
        severity: selectedCrop.toLowerCase() === 'wheat' ? 'High' : 'Moderate',
        description: selectedCrop.toLowerCase() === 'wheat' 
          ? 'Rust diseases are caused by fungal pathogens that produce orange, yellow, or brown pustules on leaves, disrupting photosynthesis and weakening crop stems.'
          : 'Leaf spot is a plant disease that causes small brown or black spots on leaves, often with yellow edges. It is mainly caused by fungi and spreads in humid, wet conditions.',
        treatment: selectedCrop.toLowerCase() === 'wheat' ? 'Propiconazole or Tebuconazole' : 'Mancozeb or Carbendazim',
        dosage: selectedCrop.toLowerCase() === 'wheat' ? '1.0 ml per liter of water' : '1.0 - 2.0 g per liter of water',
        confidence: 0.88,
        bboxes: [
          { x: 15.0, y: 10.0, w: 30.0, h: 25.0, label: 'Infected Spot', confidence: 0.82 },
          { x: 50.0, y: 45.0, w: 20.0, h: 15.0, label: 'Infected Spot', confidence: 0.74 },
          { x: 65.0, y: 25.0, w: 25.0, h: 35.0, label: 'Infected Spot', confidence: 0.89 }
        ],
        products: [
          { name: selectedCrop.toLowerCase() === 'wheat' ? 'Propiconazole' : 'Mancozeb', price: '₹-196', size: '100gm' },
          { name: selectedCrop.toLowerCase() === 'wheat' ? 'Tebuconazole' : 'Carbendazim', price: '₹-196', size: '100gm' }
        ]
      };
      
      setDetectionResult(mockResult);
    } finally {
      setIsProcessingDetection(false);
    }
  };

  if (isProcessingDetection && uploadedImageUrl && selectedCrop !== 'Crop name') {
    return <DetectionProcessingPage selectedCrop={selectedCrop} />;
  }

  if (detectionResult && uploadedImageUrl && selectedCrop !== 'Crop name') {
    return (
      <DetectionResultPage
        result={detectionResult}
        imageUrl={uploadedImageUrl}
        onClear={() => {
          URL.revokeObjectURL(uploadedImageUrl);
          setUploadedImageUrl(null);
          setSelectedCrop('Crop name');
          setDetectionResult(null);
          setIsProcessingDetection(false);
          router.push('/monitoring-detection');
        }}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#F2F2F2] p-3 sm:p-[28px]">
      <div className="grid w-full max-w-[1550px] grid-cols-1 gap-[14px] xl:grid-cols-[minmax(0,1fr)_462px]">
        <div className="min-h-0 overflow-hidden rounded-[20px] bg-white xl:min-h-[1010px]">
          <TaskCalendar />
          <Backlogs />
        </div>

        <aside className="space-y-[12px]">
          <DiseaseDetectionCard
            selectedCrop={selectedCrop}
            onCropChange={setSelectedCrop}
            onImageUpload={handleImageUpload}
          />
          <InfectionChance />
        </aside>
      </div>

      <FertilizerCalculatorModal isOpen={fertilizerModalOpen} onClose={() => setFertilizerModalOpen(false)} />
    </div>
  );
}
