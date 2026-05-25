import { GisShell } from '@/features/shell/GisShell';
import { ComingSoonView } from '@/features/shell/ComingSoonView';
import { placeholderCopy } from '@/features/shell/config';

export default function CarbonSustainabilityPage() {
  return (
    <GisShell>
      <ComingSoonView {...placeholderCopy['carbon-sustainability']} />
    </GisShell>
  );
}

