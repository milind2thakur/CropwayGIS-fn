'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function PanelShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[12px] border border-white/60 bg-white/90 shadow-sm backdrop-blur-sm', className)}>
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[8px] border border-black/5 bg-white px-3 py-2', className)}>
      <div className="font-montserrat text-[10px] font-medium leading-[130%] text-black/55">{label}</div>
      <div className="mt-1 font-montserrat text-[18px] font-semibold leading-none text-ink">{value}</div>
      {detail ? <div className="mt-1 font-montserrat text-[10px] leading-[130%] text-black/55">{detail}</div> : null}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
}) {
  const toneClass = {
    neutral: 'bg-black/5 text-black/65',
    success: 'bg-greenLight text-greenDarkActive',
    warning: 'bg-[#FFF3C4] text-[#7A5E12]',
    danger: 'bg-red-50 text-red-700',
  }[tone];

  return (
    <span className={cn('inline-flex h-[22px] items-center rounded-full px-2 font-montserrat text-[10px] font-semibold leading-none', toneClass, className)}>
      {children}
    </span>
  );
}

export function LoadingPanel({
  message = 'Loading...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <PanelShell className={cn('flex h-full flex-col items-center justify-center gap-4', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#407327] border-t-transparent" />
      <p className="font-montserrat text-sm text-black/55">{message}</p>
    </PanelShell>
  );
}

export function ErrorRetryPanel({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <PanelShell className={cn('flex h-full flex-col items-center justify-center px-4 text-center', className)}>
      <h3 className="font-montserrat text-lg font-semibold text-black">{title}</h3>
      <p className="mt-2 font-montserrat text-xs leading-relaxed text-black/60">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-[10px] bg-[#407327] px-5 py-2.5 font-montserrat text-xs font-semibold text-white transition hover:bg-[#345c20]"
        >
          Retry
        </button>
      ) : null}
    </PanelShell>
  );
}

export function EmptyStatePanel({
  title,
  message,
  className,
}: {
  title: string;
  message: string;
  className?: string;
}) {
  return (
    <PanelShell className={cn('px-4 py-5 text-center', className)}>
      <h3 className="font-montserrat text-[14px] font-semibold text-ink">{title}</h3>
      <p className="mt-2 font-montserrat text-[12px] leading-[140%] text-muted">{message}</p>
    </PanelShell>
  );
}

