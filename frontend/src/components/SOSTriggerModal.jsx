import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, Shield, EyeOff } from 'lucide-react';

const CRISIS_TYPES = [
  { id: 'medical', label: 'Medical', icon: '🏥', color: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/30' },
  { id: 'fire', label: 'Fire', icon: '🔥', color: 'from-red-500 to-red-600', glow: 'shadow-red-500/30' },
  { id: 'gas_leak', label: 'Gas Leak', icon: '💨', color: 'from-orange-500 to-orange-600', glow: 'shadow-orange-500/30' },
  { id: 'accident', label: 'Accident', icon: '🚗', color: 'from-purple-500 to-purple-600', glow: 'shadow-purple-500/30' },
  { id: 'threat', label: 'Threat', icon: '⚠️', color: 'from-rose-600 to-rose-700', glow: 'shadow-rose-500/30' },
  { id: 'other', label: 'Other', icon: '📢', color: 'from-slate-500 to-slate-600', glow: 'shadow-slate-500/30' },
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

  const activeType = CRISIS_TYPES.find(t => t.id === selectedType);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md glass rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-danger flex items-center justify-center glow-danger">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Emergency SOS</h2>
                <p className="text-xs text-slate-400">Broadcast to nearby responders</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Crisis Type Grid */}
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">What's happening?</label>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {CRISIS_TYPES.map(type => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedType(type.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                  selectedType === type.id
                    ? `bg-gradient-to-br ${type.color} border-transparent shadow-lg ${type.glow} text-white`
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600'
                }`}
              >
                <span className="text-xl">{type.icon}</span>
                <span className="text-xs font-semibold">{type.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Radius Selector */}
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Broadcast Radius</label>
          <div className="flex gap-2 mb-6">
            {RADII.map(r => (
              <motion.button
                key={r.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRadius(r.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  selectedRadius === r.value
                    ? 'gradient-brand border-transparent text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                {r.label}
              </motion.button>
            ))}
          </div>

          {/* Anonymous Toggle for threats */}
          <AnimatePresence>
            {selectedType === 'threat' && (
              <motion.label
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-6 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold text-rose-300 text-sm">Send Anonymously</span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 accent-rose-500 rounded"
                />
              </motion.label>
            )}
          </AnimatePresence>

          {/* Details */}
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Details (Optional)</label>
          <textarea
            placeholder="Number of injured, vehicle description..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full min-h-[80px] p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 text-white text-sm placeholder-slate-500 font-normal focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/30 transition-all mb-6 resize-none"
          />

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl gradient-danger text-white font-extrabold text-base tracking-wide glow-danger hover:shadow-red-500/40 transition-shadow flex items-center justify-center gap-2"
          >
            <Radio className="w-5 h-5" />
            BROADCAST SOS
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
