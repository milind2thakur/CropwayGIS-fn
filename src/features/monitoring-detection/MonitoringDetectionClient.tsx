'use client';

import { 
  ChevronDown, 
  Image as ImageIcon, 
  Share2, 
  Plus, 
  MoreVertical,
  AlertTriangle 
} from 'lucide-react';

import { cn } from '@/lib/utils';

// --- Sub-components ---

function TaskCard({ 
  title, 
  status, 
  day, 
  subtitle 
}: { 
  title: string; 
  status: 'Completed' | 'Pending' | 'Ongoing'; 
  day: string;
  subtitle?: string;
}) {
  const statusColors = {
    Completed: 'bg-[#eff4eb] text-[#2B4D1A] border-[#dbe6d4]',
    Pending: 'bg-[#fff9e6] text-[#856404] border-[#ffeeba]',
    Ongoing: 'bg-[#2B4D1A] text-white border-transparent',
  };

  return (
    <div className={cn(
      "relative flex flex-col justify-between p-3 rounded-xl border transition-all h-[100px]",
      statusColors[status]
    )}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium leading-tight">{title}</span>
          {subtitle && <span className="text-[8px] opacity-70 leading-tight mt-0.5">{subtitle}</span>}
        </div>
        <MoreVertical className="h-3 w-3 opacity-50 cursor-pointer" />
      </div>
      <div className="flex justify-between items-end mt-auto">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          status === 'Ongoing' ? "text-white" : "opacity-80"
        )}>
          {status === 'Ongoing' ? 'Ongoing' : status === 'Completed' ? 'Compleated' : 'Pending'}
        </span>
        <span className={cn(
          "text-xs font-semibold",
          status === 'Ongoing' ? "text-white" : "text-[#243620]"
        )}>{day}</span>
      </div>
    </div>
  );
}

function TaskCalendar() {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Sun'];
  
  return (
    <div className="bg-white rounded-[24px] border border-line p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#243620]">Task Calender</h2>
        <button className="flex items-center gap-2 bg-[#2B4D1A] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#203a13] transition-colors">
          Add Task 
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
            <Plus className="h-3 w-3 text-white" />
          </span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0 mb-4 bg-[#eef2ff] rounded-lg overflow-hidden">
        {days.map(day => (
          <div key={day} className="text-center text-sm font-medium text-[#243620] py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <span className="text-sm font-semibold text-[#243620]">May</span>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {/* Row 1 */}
        <TaskCard title="Ploughing" status="Completed" day="01" />
        <TaskCard title="Ploughing" status="Pending" day="02" />
        <TaskCard title="Ploughing" status="Completed" day="03" />
        <TaskCard title="Ploughing" status="Completed" day="04" />
        <TaskCard title="Harrowing" status="Pending" day="05" />
        <TaskCard title="Harrowing" status="Completed" day="06" />
        <TaskCard title="Harrowing" status="Completed" day="07" />

        {/* Row 2 */}
        <TaskCard title="Leveling" status="Pending" day="09" />
        <TaskCard title="Leveling" status="Completed" day="09" />
        <TaskCard title="Organic manure" subtitle="Fertilizers (NPK) Biofertilizers" status="Pending" day="10" />
        <TaskCard title="Organic manure" subtitle="Fertilizers (NPK) Biofertilizers" status="Completed" day="11" />
        <TaskCard title="Organic manure" subtitle="Fertilizers (NPK) Biofertilizers" status="Completed" day="12" />
        <TaskCard title="Irrigation" status="Pending" day="13" />
        <TaskCard title="Irrigation" status="Completed" day="14" />

        {/* Row 3 */}
        <TaskCard title="Sowing" status="Pending" day="15" />
        <TaskCard title="Sowing" status="Completed" day="16" />
        <TaskCard title="Sowing" status="Completed" day="17" />
        <TaskCard title="Fertilizer Application" status="Pending" day="18" />
        <TaskCard title="Fertilizer Application" status="Ongoing" day="19" />
        <div className="h-[100px] rounded-xl bg-[#f5f5f5] border border-transparent flex justify-end p-3">
          <span className="text-xs font-semibold text-muted">20</span>
        </div>
        <div className="h-[100px] rounded-xl bg-[#f5f5f5] border border-transparent flex justify-end p-3">
          <span className="text-xs font-semibold text-muted">21</span>
        </div>

        {/* Empty rows for 22-31 */}
        {[22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(d => (
          <div key={d} className="h-[100px] rounded-xl bg-[#f5f5f5] border border-transparent flex justify-end p-3">
            <span className="text-xs font-semibold text-muted">{d}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded-full bg-[#2B4D1A]" />
          <span className="text-xs font-medium text-[#243620]">Present Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded-full bg-[#fff9e6] border border-[#ffeeba]" />
          <span className="text-xs font-medium text-[#243620]">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded-full bg-[#eff4eb] border border-[#dbe6d4]" />
          <span className="text-xs font-medium text-[#243620]">Completed</span>
        </div>
      </div>
    </div>
  );
}

function Backlogs() {
  const items = [
    { title: 'Ploughing', days: '14 days', status: 'Pending', day: '02' },
    { title: 'Harrowing', days: '12 days', status: 'Pending', day: '05' },
    { title: 'Leveling', days: '8 days', status: 'Pending', day: '08' },
    { title: 'Organic manure', subtitle: 'Fertilizers (NPK) Biofertilizers', days: '7 days', status: 'Pending', day: '10' },
    { title: 'Irrigation', days: '4 days', status: 'Pending', day: '13' },
    { title: 'Irrigation', days: '3 days', status: 'Pending', day: '15' },
    { title: 'Fertilizer Application', days: '1 day', status: 'Pending', day: '18' },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-line p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#243620] mb-4">Backlogs</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item, idx) => (
          <div key={idx} className="min-w-[150px] flex flex-col justify-between p-3 rounded-xl border border-[#ffeeba] bg-[#fff9e6] h-[100px]">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium leading-tight">{item.title}</span>
                <span className="text-[8px] opacity-70 leading-tight mt-0.5">{item.days}</span>
              </div>
              <MoreVertical className="h-3 w-3 opacity-50" />
            </div>
            <div className="flex justify-between items-end mt-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pending</span>
              <span className="text-xs font-semibold">{item.day}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiseaseDetectionCard() {
  return (
    <div className="bg-white rounded-[24px] border border-line p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="h-5 w-5 text-[#243620]" />
        <h2 className="text-lg font-semibold text-[#243620]">Disease Detection</h2>
      </div>

      <div className="bg-[#eff4eb] rounded-[24px] border border-dashed border-[#2B4D1A]/30 p-4">
        <div className="relative mb-4">
          <button className="flex w-full items-center justify-between rounded-xl bg-[#2B4D1A] px-4 py-2 text-sm font-medium text-white">
            <span>Crop name</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center bg-[#c9cebd] rounded-[24px] p-8 border border-transparent">
          <div className="mb-4">
            <ImageIcon className="h-12 w-12 text-[#243620] opacity-40" />
          </div>
          <h3 className="text-base font-semibold text-[#243620]">Upload image of leaf</h3>
          <p className="mt-1 text-[10px] text-muted text-center">
            file type: png, jpg, jpeg <br /> less then 1024kb
          </p>
        </div>
      </div>
    </div>
  );
}

function InfectionChance() {
  return (
    <div className="bg-white rounded-[24px] border border-line p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <h2 className="text-lg font-semibold text-[#243620]">Infection Chance</h2>
      </div>
      <p className="text-[10px] text-muted mb-6 leading-relaxed">
        Infection chance show the risk of your crop getting infected by prior uploaded images and missed tasks
      </p>

      <div className="relative h-[200px] w-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-muted">
          <span>100</span>
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span>0</span>
        </div>

        {/* Grid lines */}
        <div className="absolute left-6 right-0 top-0 bottom-6 flex flex-col justify-between">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-full border-b border-line/30 h-0" />
          ))}
        </div>

        {/* SVG Chart */}
        <svg className="absolute left-6 right-0 top-0 bottom-6 w-[calc(100%-24px)] h-full overflow-visible">
          {/* Risk threshold line */}
          <line x1="0" y1="80" x2="100%" y2="80" stroke="#856404" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          
          {/* Vertical marker line */}
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#2B4D1A" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

          {/* Curve */}
          <path 
            d="M 0 160 Q 50 80, 100 135 T 200 170 T 320 140 T 450 170 T 600 100" 
            fill="none" 
            stroke="#2B4D1A" 
            strokeWidth="2.5"
            className="w-full"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />

          {/* Point */}
          <circle cx="25%" cy="135" r="4" fill="white" stroke="#2B4D1A" strokeWidth="2" />
        </svg>

        {/* X-axis labels */}
        <div className="absolute left-6 right-0 bottom-0 flex justify-between text-[10px] text-muted">
          <span>June</span>
          <span>June</span>
          <span>July</span>
          <span>July</span>
          <span>Oct</span>
          <span>Oct</span>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export function MonitoringDetectionClient() {
  return (
    <div className="bg-[#fbfcfa] min-h-screen p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Calendar and Backlogs */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <TaskCalendar />
          <Backlogs />
        </div>

        {/* Right Column: Detection and Infection Chance */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          <DiseaseDetectionCard />
          <InfectionChance />
        </div>

      </div>
    </div>
  );
}
