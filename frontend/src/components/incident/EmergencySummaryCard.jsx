import React from 'react';
import { FileText } from 'lucide-react';

export default function EmergencySummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-2 relative z-10">
        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Live AI Summary</h3>
      </div>
      <p className="text-sm text-blue-100/80 leading-relaxed relative z-10">{summary}</p>
    </div>
  );
}
