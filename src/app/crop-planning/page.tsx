import { CropPlanningClient } from '@/features/crop-planning/CropPlanningClient';
import { CropPortfolioClient } from '@/features/crop-planning/CropPortfolioClient';
import { LandIntelligenceClient } from '@/features/land-intelligence/LandIntelligenceClient';
import { GisShell } from '@/features/shell/GisShell';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CropPlanningPage(props: Props) {
  const searchParams = await props.searchParams;
  const isSelectionStep = searchParams?.step === 'selection';
  const isPortfolioStep = searchParams?.step === 'portfolio';

  return (
    <GisShell>
      {isPortfolioStep ? (
        <CropPortfolioClient />
      ) : isSelectionStep ? (
        <LandIntelligenceClient />
      ) : (
        <CropPlanningClient />
      )}
    </GisShell>
  );
}
