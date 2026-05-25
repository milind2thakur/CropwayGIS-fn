import type { Metadata } from 'next';
import { Inter, Montserrat, Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import type { ReactNode } from 'react';

import { AppProviders } from '@/components/providers/AppProviders';

import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CropwayGIS',
  description: 'GIS-first crop planning workspace for Cropway.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${montserrat.variable} ${poppins.variable} ${inter.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
