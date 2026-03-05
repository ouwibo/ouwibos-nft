import { Metadata } from 'next';
import OuwiboBaseApp from '@/components/OuwiboBaseApp';

// Metadata API for Next.js App Router (Page Level)
export const metadata: Metadata = {
  other: {
    'base:app_id': '69a11773dce51e894f97278f',
  },
};

export default function Home() {
  return <OuwiboBaseApp />;
}
