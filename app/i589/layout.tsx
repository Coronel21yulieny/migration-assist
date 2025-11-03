// app/i589/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "I-589 | Migration Assist" };

export default function I589Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-20 bg-[url('/usa-hero.jpg')] bg-cover bg-center" />
      <div className="fixed inset-0 -z-10 bg-white/50 backdrop-blur-sm" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-10">{children}</div>
    </div>
  );
}
