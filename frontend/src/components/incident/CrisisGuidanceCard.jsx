import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export default function CrisisGuidanceCard({ steps, loading }) {
  return (
    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-3 relative z-10">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">AI First-Response Guidance</h3>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 relative z-10">
          <div className="h-3 bg-indigo-500/10 rounded-full w-full animate-pulse" />
          <div className="h-3 bg-indigo-500/10 rounded-full w-[85%] animate-pulse" />
          <div className="h-3 bg-indigo-500/10 rounded-full w-[60%] animate-pulse" />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 relative z-10">
          {steps?.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 items-start"
            >
              <span className="shrink-0 w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold font-mono">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-sm text-slate-200 leading-relaxed pt-0.5">{step}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
