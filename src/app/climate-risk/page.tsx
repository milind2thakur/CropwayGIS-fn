import { GisShell } from '@/features/shell/GisShell';
import { ClimateRiskClient } from '@/features/climate-risk/ClimateRiskClient';

export default function ClimateRiskPage() {
  return (
    <GisShell>
      <ClimateRiskClient />
    </GisShell>
  );
}
