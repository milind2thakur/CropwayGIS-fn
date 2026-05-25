import { GisShell } from '@/features/shell/GisShell';
import { HomeHero } from '@/features/shell/HomeHero';

export default function HomePage() {
  return (
    <GisShell>
      <div className="h-full overflow-hidden">
        <HomeHero />
      </div>
    </GisShell>
  );
}
