import { Footer } from '@/src/modules/landing/components/Footer';
import { Navbar } from '@/src/modules/landing/components/Navbar';
import type { ReactNode } from 'react';

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
