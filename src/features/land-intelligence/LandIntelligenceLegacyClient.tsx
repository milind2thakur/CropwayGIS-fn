'use client';

import { LandIntelligenceClient } from './LandIntelligenceClient';

type LandIntelligenceLegacyClientProps = {
  mode?: 'land-intelligence' | 'crop-planning-selection';
};

export function LandIntelligenceLegacyClient({
  mode = 'land-intelligence',
}: LandIntelligenceLegacyClientProps) {
  return <LandIntelligenceClient mode={mode} />;
}

