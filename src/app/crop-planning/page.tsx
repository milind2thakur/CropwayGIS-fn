import { CropPlanningClient } from '@/features/crop-planning/CropPlanningClient';
import { GisShell } from '@/features/shell/GisShell';

export default function CropPlanningPage() {
  return (
    <GisShell>
      <CropPlanningClient />
    </GisShell>
  );
}

