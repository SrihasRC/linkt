'use client';

import dynamic from 'next/dynamic';

// Dynamically import the component that uses useSearchParams
const HomeContent = dynamic(() => import('./page-wrapped'), {
  ssr: false, // Disable server-side rendering for this component
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
          <div className="w-8 h-8 rounded bg-primary/40"></div>
        </div>
        <p className="text-muted-foreground">Loading Linkt...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return <HomeContent />;
}
