import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { submitDebrief, rateResponder } from '../../services/api';

export default function DebriefModal({ incidentId, questions, responders, onClose }) {
  const [wasReal, setWasReal] = useState(null);
  const [answers, setAnswers] = useState(questions.map(() => ''));
  const [ratings, setRatings] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const notes = questions.map((q, i) => `Q: ${q}\nA: ${answers[i] || 'N/A'}`).join('\n\n');
      await submitDebrief(incidentId, { wasReal: wasReal === true, notes });
      await Promise.all(Object.entries(ratings).map(([rId, rating]) => rateResponder(incidentId, rId, rating)));
      onClose();
    } catch (err) {
      console.error('Debrief failed:', err);
      alert('Failed to submit. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg glass rounded-2xl p-6 shadow-2xl my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center glow-brand">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Incident Debrief</h2>
              <p className="text-xs text-slate-400">Help improve community safety</p>
            </div>
          </div>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-white transition-colors underline decoration-slate-700 hover:decoration-white font-medium">
            Skip
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-5" />

        {/* Was Real? */}
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Was this a real emergency?</label>
        <div className="flex gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setWasReal(true)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 border ${
              wasReal === true
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-transparent text-white shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> Yes, real
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setWasReal(false)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 border ${
              wasReal === false
                ? 'bg-gradient-to-r from-red-500 to-red-600 border-transparent text-white shadow-lg shadow-red-500/25'
                : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            <XCircle className="w-4 h-4" /> False alarm
          </motion.button>
        </div>

        {/* Questions */}
        {questions.map((q, i) => (
          <div key={i} className="mb-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{q}</label>
            <textarea
              value={answers[i]}
              onChange={(e) => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }}
              placeholder="Your answer..."
              className="w-full min-h-[80px] p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all resize-none"
            />
          </div>
        ))}

        {/* Rate Responders */}
        {responders?.length > 0 && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Rate Responders</h3>
            <div className="flex flex-col gap-2 mb-6">
              {responders.map(r => {
                const rId = r.id || r.user?.toString() || r.user;
                return (
                  <div key={rId} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold">
                        {(r.name || 'R')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">{r.name || 'Responder'}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRatings(prev => ({ ...prev, [rId]: star }))}
                          className={`text-lg px-0.5 transition-all hover:scale-125 ${
                            (ratings[rId] || 0) >= star ? 'text-amber-400' : 'text-slate-700 hover:text-slate-500'
                          }`}
                        >★</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting || wasReal === null}
          className="w-full py-3.5 rounded-xl gradient-brand text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Debrief'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
