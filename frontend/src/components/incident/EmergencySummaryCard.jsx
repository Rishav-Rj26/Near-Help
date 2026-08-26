import React from 'react';

export default function EmergencySummaryCard({ summary }) {
  if (!summary) return null;
  
  return (
    <div className="bg-blue-900/20 border-[3px] border-blue-800 p-4 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] mb-4 mt-4 relative">
      <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400 mb-2 absolute -top-3 left-4 bg-slate-900 px-2 border-2 border-blue-800">
        Live AI Summary
      </h3>
      <p className="text-sm text-blue-100 leading-relaxed mt-2 font-mono">
        {summary}
      </p>
    </div>
  );
}
