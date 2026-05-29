'use client';

import { LandIntelligenceClient } from './LandIntelligenceClient';

type SoilIntelligenceClientProps = {
  mode?: 'land-intelligence' | 'crop-planning-selection';
};

export function SoilIntelligenceClient({
  mode = 'land-intelligence',
}: SoilIntelligenceClientProps) {
  return <LandIntelligenceClient mode={mode} initialView="soil-intelligence" />;
}

