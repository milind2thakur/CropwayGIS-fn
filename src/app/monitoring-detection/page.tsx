import { GisShell } from '@/features/shell/GisShell';
import { MonitoringDetectionClient } from '@/features/monitoring-detection/MonitoringDetectionClient';

export default function MonitoringDetectionPage() {
  return (
    <GisShell>
      <MonitoringDetectionClient />
    </GisShell>
  );
}

