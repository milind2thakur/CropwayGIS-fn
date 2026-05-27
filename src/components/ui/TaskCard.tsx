import React, { useState, useRef, useEffect } from 'react';

type TaskStatus = 'Pending' | 'Complete';

interface TaskCardProps {
  title?: string;
  count?: string;
  status?: TaskStatus;
  menuActionName?: string;
  onComplete?: () => void;
  onMenuAction?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title = 'Fertilizer Application',
  count = '18',
  status = 'Pending',
  menuActionName = 'Calculate Cost',
  onComplete,
  onMenuAction,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPending = status === 'Pending';

  // Colors based on variant
  const bgClass = isPending ? 'bg-[#FBF4D7]' : 'bg-[#E3ECDF]';
  const statusColorClass = isPending ? 'text-[#6D6339]' : 'text-[#2B4D1A]';

  return (
    <div
      className={`relative flex h-[69px] w-[114px] flex-col justify-between rounded-[10px] border-[0.5px] border-[rgba(0,0,0,0.1)] p-[9px] pb-[8px] pr-[7px] pt-[11px] ${bgClass}`}
    >
      {/* Top Row: Title and Menu Icon */}
      <div className="flex items-start justify-between">
        <span className="font-montserrat text-[8px] font-normal leading-[10px] text-[#222222]">
          {title}
        </span>
        
        {/* Vertical Ellipsis Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-[12px] w-[10px] flex-col items-center justify-center gap-[2px] opacity-80 hover:opacity-100"
        >
          <div className="h-[2px] w-[2px] rounded-full bg-[#222222]" />
          <div className="h-[2px] w-[2px] rounded-full bg-[#222222]" />
          <div className="h-[2px] w-[2px] rounded-full bg-[#222222]" />
        </button>
      </div>

      {/* Bottom Row: Status and Count */}
      <div className="flex items-end justify-between">
        <span
          className={`font-montserrat text-[8px] font-bold leading-[10px] ${statusColorClass}`}
        >
          {status}
        </span>
        <span className="font-montserrat text-[10px] font-medium leading-[130%] text-[#000000]">
          {count}
        </span>
      </div>

      {/* Dropdown Menu (Variant 2) */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute left-[30px] top-[12px] z-10 flex h-[46px] w-[91px] flex-col justify-center gap-[4px] rounded-[10px] bg-white px-[8px] py-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
        >
          {/* Completed Action */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              onComplete?.();
            }}
            className="flex items-center justify-between gap-[2px] hover:opacity-80"
          >
            <span className="text-left font-montserrat text-[8px] font-normal leading-[10px] text-[#222222]">
              Completed
            </span>
            {/* Simple Check SVG */}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8L6.5 10.5L11 4.5" stroke="#222222" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dynamic Action (Know More / Calculate Cost) */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              onMenuAction?.();
            }}
            className="flex items-center justify-between gap-[2px] hover:opacity-80"
          >
            <span className="text-left font-montserrat text-[8px] font-normal leading-[10px] text-[#222222]">
              {menuActionName}
            </span>
            {/* Simple Arrow SVG */}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7.5H11M11 7.5L8.5 5M11 7.5L8.5 10" stroke="#222222" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
