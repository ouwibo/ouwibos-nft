'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const Providers = dynamic(
  () => import('./Providers').then((mod) => mod.Providers),
  { ssr: false }
);

export function RootClientLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
