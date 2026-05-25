import { GisShell } from '@/features/shell/GisShell';
import { LandIntelligenceClient } from '@/features/land-intelligence/LandIntelligenceClient';

export default function LandIntelligencePage() {
  return (
    <GisShell>
      <LandIntelligenceClient />
    </GisShell>
  );
}

