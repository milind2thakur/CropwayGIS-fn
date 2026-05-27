import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { dashboardStats, topSignalCards } from './config';

export function ComingSoonView({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="rounded-[28px] border border-line bg-panel p-6 shadow-panel lg:p-8">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-greenDark">{eyebrow}</p>
          <h1 className="font-montserrat text-[32px] font-medium leading-[130%] tracking-tight text-ink lg:text-[48px]">{title}</h1>
          <p className="mt-4 max-w-xl font-montserrat text-[16px] font-medium leading-[130%] text-muted">{body}</p>
        </div>
        <Link
          href="/crop-planning"
          className="inline-flex h-[43px] items-center justify-center gap-[10px] rounded-[9px] border border-transparent bg-greenDark px-5 py-[10px] font-montserrat text-[18px] font-medium leading-[130%] text-white transition-colors hover:bg-greenDarkHover"
        >
          Open Crop Planning
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {dashboardStats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-line bg-white px-4 py-5">
            <div className="font-montserrat text-[24px] font-medium leading-[130%] text-ink">{item.value}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {topSignalCards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="font-montserrat text-[18px] font-medium leading-[130%] text-ink">{card.title}</h2>
            <p className="mt-3 font-montserrat text-[14px] font-medium leading-[130%] text-muted">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
