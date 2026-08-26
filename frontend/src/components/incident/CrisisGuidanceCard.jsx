import React from 'react';

export default function CrisisGuidanceCard({ steps, loading }) {
  return (
    <div className="bg-slate-950 border-[3px] border-slate-700 p-4 shadow-[4px_4px_0px_0px_rgba(51,65,85,1)] mb-4 mt-4 relative">
      <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3 absolute -top-3 left-4 bg-slate-900 px-2 border-2 border-slate-700">
        AI First-Response Guidance
      </h3>
      
      {loading ? (
        <div className="flex flex-col gap-3 animate-pulse mt-3">
          <div className="h-4 bg-slate-800 rounded-none w-full"></div>
          <div className="h-4 bg-slate-800 rounded-none w-[85%]"></div>
          <div className="h-4 bg-slate-800 rounded-none w-[60%]"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-3">
          {steps?.map((step, i) => (
            <div key={i} className="text-sm text-slate-200 leading-relaxed flex gap-3 items-start">
              <span className="font-mono text-blue-400 font-bold shrink-0 pt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
