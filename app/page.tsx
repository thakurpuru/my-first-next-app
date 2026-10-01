import React from 'react';
import dynamic from 'next/dynamic';
import ClientTableWrapper from './components/ClientTableWraper';
export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Portfolio Holdings</h1>
        <p className="text-slate-600 mb-6">Track current prices, overall growth, and valuation multiples.</p>
        <ClientTableWrapper/>
       
      </div>
    </main>
  );
}