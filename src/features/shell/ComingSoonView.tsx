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
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-moss">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#23311f] lg:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted lg:text-base">{body}</p>
        </div>
        <Link
          href="/crop-planning"
          className="inline-flex items-center gap-2 rounded-xl bg-moss px-4 py-3 text-sm font-medium text-white transition hover:bg-[#294f1f]"
        >
          Open Crop Planning
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {dashboardStats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-line bg-white px-4 py-5">
            <div className="text-2xl font-semibold text-[#21311f]">{item.value}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {topSignalCards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-line bg-[#fbfcfa] p-5">
            <h2 className="text-lg font-semibold text-[#243620]">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

