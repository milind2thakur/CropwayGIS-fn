import { GisShell } from '@/features/shell/GisShell';
import { ComingSoonView } from '@/features/shell/ComingSoonView';
import { placeholderCopy } from '@/features/shell/config';

export default function SupplyChainLogisticsPage() {
  return (
    <GisShell>
      <ComingSoonView {...placeholderCopy['supply-chain-logistics']} />
    </GisShell>
  );
}

