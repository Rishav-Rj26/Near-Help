import React, { useState } from 'react';
import { submitDebrief, rateResponder } from '../../services/api';

export default function DebriefModal({ incidentId, questions, responders, onClose }) {
  const [wasReal, setWasReal] = useState(null);
  const [answers, setAnswers] = useState(questions.map(() => ''));
  const [ratings, setRatings] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleStarClick = (responderId, rating) => {
    setRatings(prev => ({ ...prev, [responderId]: rating }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const notes = questions.map((q, i) => `Q: ${q}\nA: ${answers[i] || 'N/A'}`).join('\n\n');
      await submitDebrief(incidentId, { wasReal: wasReal === true, notes });

      const ratingPromises = Object.entries(ratings).map(([rId, rating]) => 
        rateResponder(incidentId, rId, rating)
      );
      await Promise.all(ratingPromises);

      onClose();
    } catch (err) {
      console.error('Failed to submit debrief:', err);
      alert('Failed to submit debrief. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-slate-950 border-[3px] border-white p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative transition-all animate-in zoom-in-95 my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2 border-b-2 border-slate-700 pb-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Incident Debrief</h2>
          <button 
            onClick={onClose} 
            className="text-sm font-mono font-bold text-slate-400 hover:text-white uppercase tracking-widest underline decoration-2 decoration-slate-700 hover:decoration-white transition-all"
          >
            Skip
          </button>
        </div>
        
        <p className="text-sm text-slate-400 font-mono mb-8">
          Your feedback helps improve community safety and responder trust.
        </p>

        <label className="block text-sm font-black uppercase tracking-widest text-slate-300 mb-3">
          Was this a real emergency?
        </label>
        <div className="flex gap-4 mb-8">
          <button 
            className={`flex-1 py-3 px-4 font-black uppercase tracking-widest text-sm transition-all border-[3px] ${wasReal === true ? 'bg-green-600 border-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}
            onClick={() => setWasReal(true)}
          >
            Yes, it was real
          </button>
          <button 
            className={`flex-1 py-3 px-4 font-black uppercase tracking-widest text-sm transition-all border-[3px] ${wasReal === false ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}
            onClick={() => setWasReal(false)}
          >
            No, False Alarm
          </button>
        </div>

        {questions.map((q, i) => (
          <div key={i} className="mb-6">
            <label className="block text-sm font-black uppercase tracking-widest text-slate-300 mb-3">{q}</label>
            <textarea 
              value={answers[i]} 
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[i] = e.target.value;
                setAnswers(newAnswers);
              }}
              placeholder="Your answer..."
              className="w-full min-h-[100px] p-3 border-2 border-slate-700 bg-slate-900 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        ))}

        {responders && responders.length > 0 && (
          <div className="mb-8 border-t-2 border-slate-800 pt-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 mb-4">Rate Responders</h3>
            <div className="flex flex-col gap-3">
              {responders.map(r => {
                const rId = r.id || r.user?.toString() || r.user;
                const rName = r.name || 'Responder';
                return (
                  <div key={rId} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rName}</span>
                      {r.hasRelevantSkill && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500 text-[10px] font-black uppercase tracking-widest">
                          Skilled
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          onClick={() => handleStarClick(rId, star)}
                          className={`text-xl leading-none px-1 transition-colors hover:scale-125 ${
                            (ratings[rId] || 0) >= star ? 'text-yellow-500' : 'text-slate-700 hover:text-slate-500'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={submitting || wasReal === null}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg tracking-widest uppercase border-[3px] border-blue-600 hover:border-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {submitting ? 'Submitting...' : 'Submit Debrief'}
        </button>
      </div>
    </div>
  );
}
