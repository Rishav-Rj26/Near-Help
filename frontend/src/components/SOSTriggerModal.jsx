import React, { useState } from 'react';

const CRISIS_TYPES = ['medical', 'fire', 'gas_leak', 'accident', 'threat', 'other'];
const CRISIS_COLORS = {
  medical: 'bg-blue-500 border-blue-500 text-white',
  fire: 'bg-red-500 border-red-500 text-white',
  gas_leak: 'bg-orange-500 border-orange-500 text-white',
  accident: 'bg-purple-500 border-purple-500 text-white',
  threat: 'bg-rose-800 border-rose-800 text-white',
  other: 'bg-slate-500 border-slate-500 text-white',
};

const RADII = [500, 1000, 2000];

export default function SOSTriggerModal({ isOpen, onClose, onSubmit, location }) {
  const [selectedType, setSelectedType] = useState('medical');
  const [selectedRadius, setSelectedRadius] = useState(1000);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      crisisType: selectedType,
      radius: selectedRadius,
      isAnonymous: selectedType === 'threat' ? isAnonymous : false,
      details: details.trim(),
      location,
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-slate-900 border-[3px] border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl font-black">&times;</button>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-6 border-b-2 border-slate-700 pb-2">Trigger SOS</h2>
        
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Crisis Type</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {CRISIS_TYPES.map(type => (
            <button 
              key={type} 
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 font-black uppercase tracking-widest text-xs border-[2px] transition-all ${selectedType === type ? CRISIS_COLORS[type] : 'bg-transparent border-slate-600 text-slate-400 hover:border-slate-400'}`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Broadcast Radius</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {RADII.map(r => (
            <button 
              key={r} 
              onClick={() => setSelectedRadius(r)} 
              className={`px-3 py-1 font-black uppercase tracking-widest text-xs border-[2px] transition-all ${selectedRadius === r ? 'bg-white border-white text-black' : 'bg-transparent border-slate-600 text-slate-400 hover:border-slate-400'}`}
            >
              {r >= 1000 ? `${r/1000}km` : `${r}m`}
            </button>
          ))}
        </div>

        {selectedType === 'threat' && (
          <label className="flex items-center justify-between p-3 bg-rose-950/30 border-2 border-rose-900 mb-6 cursor-pointer">
            <span className="font-bold text-rose-500 uppercase tracking-widest text-xs">Send Anonymously</span>
            <input 
              type="checkbox" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)} 
              className="w-5 h-5 accent-rose-500"
            />
          </label>
        )}

        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Additional Details (Optional)</h3>
        <textarea 
          placeholder="e.g., Number of injured, suspicious vehicle description..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full min-h-[80px] p-3 border-2 border-slate-700 bg-slate-950 text-white font-mono text-sm mb-6 focus:outline-none focus:border-red-500"
        />

        <button 
          onClick={handleSubmit}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xl tracking-widest uppercase border-[3px] border-red-600 hover:border-white shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all"
        >
          BROADCAST SOS
        </button>
      </div>
    </div>
  );
}
