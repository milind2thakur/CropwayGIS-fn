import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Check, ArrowRight } from 'lucide-react';

export type TaskStatus = 'pending' | 'complete';

export interface TaskCardProps {
  title?: string;
  status?: TaskStatus;
  count?: number;
  onStatusChange?: (newStatus: TaskStatus) => void;
  onCalculateCost?: () => void;
}

export function TaskCard({
  title = 'Fertilizer Application',
  status = 'pending',
  count = 18,
  onStatusChange,
  onCalculateCost,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isPending = status === 'pending';

  // Handle outside click to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMarkComplete = () => {
    onStatusChange?.('complete');
    setIsMenuOpen(false);
  };

  const handleCalculateCost = () => {
    onCalculateCost?.();
    setIsMenuOpen(false);
  };

  return (
    <div
      className="relative box-border"
      style={{
        width: 114,
        height: 69,
        background: isPending ? '#FBF4D7' : '#E3ECDF',
        border: '0.5px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 10,
      }}
    >
      {/* Title */}
      <div
        className="absolute flex items-center font-montserrat text-[#222222]"
        style={{
          width: 83,
          height: 10,
          left: 9,
          top: 11,
          fontWeight: 400,
          fontSize: 8,
          lineHeight: '10px',
        }}
      >
        {title}
      </div>

      {/* Menu Button */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="absolute flex items-center justify-center opacity-80 transition-opacity hover:opacity-100"
        style={{
          width: 10,
          height: 12,
          right: 7,
          top: 9,
        }}
      >
        <MoreVertical size={12} color="#222222" />
      </button>

      {/* Status Label */}
      <div
        className="absolute flex items-center font-montserrat"
        style={{
          height: 10,
          left: 9,
          top: 51,
          fontWeight: 700,
          fontSize: 8,
          lineHeight: '10px',
          color: isPending ? '#6D6339' : '#2B4D1A',
        }}
      >
        {isPending ? 'Pending' : 'Complete'}
      </div>

      {/* Count */}
      <div
        className="absolute flex items-center text-black font-montserrat"
        style={{
          height: 13,
          right: 9,
          top: 49,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: '130%',
        }}
      >
        {count}
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute z-10 box-border bg-white"
          style={{
            width: 91,
            height: 46,
            left: 30,
            top: 12,
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: 10,
          }}
        >
          <button
            onClick={handleMarkComplete}
            className="absolute flex w-[75px] items-center justify-between transition-colors hover:bg-gray-50"
            style={{
              height: 15,
              left: 8,
              top: 5,
            }}
          >
            <span
              className="font-montserrat text-[#222222]"
              style={{
                fontWeight: 400,
                fontSize: 8,
                lineHeight: '10px',
              }}
            >
              Completed
            </span>
            <Check size={10} color="#222222" />
          </button>

          <button
            onClick={handleCalculateCost}
            className="absolute flex w-[75px] items-center justify-between transition-colors hover:bg-gray-50"
            style={{
              height: 15,
              left: 8,
              top: 24,
            }}
          >
            <span
              className="font-montserrat text-[#222222]"
              style={{
                fontWeight: 400,
                fontSize: 8,
                lineHeight: '10px',
              }}
            >
              Calculate Cost
            </span>
            <ArrowRight size={10} color="#222222" />
          </button>
        </div>
      )}
    </div>
  );
}
