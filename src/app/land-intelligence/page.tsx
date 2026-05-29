import { GisShell } from '@/features/shell/GisShell';
import { LandIntelligenceLegacyClient } from '@/features/land-intelligence/LandIntelligenceLegacyClient';
import { SoilIntelligenceClient } from '@/features/land-intelligence/SoilIntelligenceClient';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LandIntelligencePage(props: Props) {
  const searchParams = await props.searchParams;
  const viewParam = searchParams?.view;
  const views = Array.isArray(viewParam) ? viewParam : [viewParam];
  const isSoilIntelligence = views.includes('soil-intelligence');

  return (
    <GisShell>
      {isSoilIntelligence ? <SoilIntelligenceClient /> : <LandIntelligenceLegacyClient />}
    </GisShell>
  );
}
