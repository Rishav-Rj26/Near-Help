import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CRISIS_TYPES = [
  { id: 'medical', label: 'Medical', tag: 'Immediate EMT', desc: 'CPR · Injury · Cardiac · Overdose · Unconscious', icon: 'medical_services', color: 'azure-med', bg: 'bg-blue-500/15', border: 'border-blue-400/30' },
  { id: 'fire', label: 'Fire & Smoke', tag: 'Extinguisher Needed', desc: 'Structural blaze · Smoke inhalation · Wildfire', icon: 'local_fire_department', color: 'rescue-red', bg: 'bg-red-500/15', border: 'border-red-400/30' },
  { id: 'gas_leak', label: 'Gas / Hazard', tag: 'Evacuate 300m', desc: 'Strong sulfur odor · Pipeline leak · Chemical spill', icon: 'warning', color: 'hazard-amber', bg: 'bg-amber-500/15', border: 'border-amber-400/30' },
  { id: 'threat', label: 'Physical Threat', tag: 'High Danger', desc: 'Assault in progress · Active intruder · Stalking', icon: 'security', color: 'violet-threat', bg: 'bg-purple-500/15', border: 'border-purple-400/30' },
];

const RADII = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
];

export default function SOSTriggerModal({ isOpen, onClose, onSubmit, location }) {
  const [selectedType, setSelectedType] = useState('medical');
  const [selectedRadius, setSelectedRadius] = useState(1000);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isCovert, setIsCovert] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      crisisType: selectedType,
      radius: selectedRadius,
      isAnonymous: isAnonymous,
      isCovert: isCovert, // new field
      details: '',
      location,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex flex-col justify-end items-center bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Map Blueprint Simulation Background Overlay */}
        <div className="absolute inset-0 blueprint-map pointer-events-none opacity-50" />
        <div className="radar-beacon absolute top-[14%] left-1/2 -translate-x-1/2 pointer-events-none opacity-50" />

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-[490px] relative z-20 bg-[#0c121e]/95 backdrop-blur-xl rounded-t-[28px] border-t border-x border-white/10 shadow-[0_-12px_45px_rgba(0,0,0,0.7)] pt-3 pb-8 px-4 sm:px-5 flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Drag Handle & Live Responder Status */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-1.5 bg-slate-700/80 rounded-full" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>14 Responders Active Within Range</span>
            </div>
          </div>

          {/* Sheet Header */}
          <header className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
            <div>
              <h1 className="text-[22px] sm:text-[24px] font-black tracking-tight text-white uppercase leading-none">
                What is happening right now?
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-azure-med">touch_app</span>
                Tap category for instant dispatch
              </p>
            </div>
            
            <button onClick={onClose} className="w-8 h-8 shrink-0 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </header>

          {/* Large Vertical Stacking Emergency Cards */}
          <section className="flex flex-col gap-2.5 overflow-y-auto max-h-[35vh] pr-0.5 custom-scrollbar">
            {CRISIS_TYPES.map(type => {
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`emergency-card w-full ${isSelected ? 'selected' : 'bg-slate-900/90 hover:bg-slate-800/80 border-slate-800'} rounded-xl p-3 flex items-center justify-between text-left transition relative overflow-hidden group border`}
                  type="button"
                >
                  {isSelected && <div className={`absolute left-0 top-0 bottom-0 w-2.5 bg-${type.color} shadow-[0_0_12px_var(--color-${type.color})]`} />}
                  
                  <div className="flex items-center gap-3.5 pl-2.5">
                    <div className={`w-11 h-11 rounded-lg ${type.bg} border ${type.border} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined text-${type.color} text-[26px]`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {type.icon}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-extrabold text-white tracking-tight">{type.label}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${type.bg} text-${type.color} border ${type.border}`}>
                          {type.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{type.desc}</p>
                    </div>
                  </div>
                  
                  <div className={`pr-1 ${isSelected ? `text-${type.color}` : 'text-slate-600'}`}>
                    <span className="material-symbols-outlined text-[24px]">
                      {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                  </div>
                </button>
              );
            })}
          </section>

          {/* Controls Bar: Range & Toggles */}
          <section className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
                  Alert Range (500m · 1km · 2km)
                </label>
                <span className="text-[11px] font-mono text-azure-med font-semibold">{selectedRadius}m Selected</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {RADII.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRadius(r.value)}
                    className={`h-9 rounded-lg font-mono text-xs transition ${
                      selectedRadius === r.value
                        ? 'border border-blue-500 bg-blue-600/25 text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                        : 'border border-slate-700 bg-slate-900/90 text-slate-300 font-semibold hover:border-slate-500'
                    }`}
                    type="button"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px w-full bg-slate-800" />

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-hazard-amber">notifications_off</span>
                  <div className="leading-tight">
                    <span className="text-[12px] font-bold text-white block">Covert</span>
                    <span className="text-[9px] text-slate-400 block font-mono">No siren on phone</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isCovert}
                  onChange={(e) => setIsCovert(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-hazard-amber focus:ring-hazard-amber/30 bg-slate-800"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-slate-300">visibility_off</span>
                  <div className="leading-tight">
                    <span className="text-[12px] font-bold text-white block">Anon Beacon</span>
                    <span className="text-[9px] text-slate-400 block font-mono">Anonymous ID</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-azure-med focus:ring-azure-med/30 bg-slate-800"
                />
              </label>
            </div>
          </section>

          {/* Full-Width Tactile Emergency Trigger Button */}
          <div className="pt-1 flex flex-col gap-2">
            <button
              onClick={handleSubmit}
              className="sos-master-btn w-full h-[62px] rounded-xl flex items-center justify-center gap-3 active:scale-[0.99] transition relative text-white"
            >
              <span className="material-symbols-outlined siren-icon-pulse text-[28px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>e911_emergency</span>
              <span className="font-black text-[18px] sm:text-[20px] uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                SEND EMERGENCY SOS NOW
              </span>
              <span className="material-symbols-outlined text-[20px] opacity-80">arrow_forward</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 911 Relayed</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-azure-med"></span> Instant Haptic Lock</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-hazard-amber"></span> Live Audio Beacon</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
