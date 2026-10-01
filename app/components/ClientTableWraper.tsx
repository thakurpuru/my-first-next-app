'use client';

import dynamic from 'next/dynamic';

// Dynamic import with ssr: false lives inside a Client Component
const StockSectorTable = dynamic(
  () => import('./stockSectorTable'),
  { 
    ssr: false,
    loading: () => <div className="p-8 text-center text-slate-400">Loading stock portfolio...</div>
  }
);

export default function ClientTableWrapper() {
  return <StockSectorTable />;
}