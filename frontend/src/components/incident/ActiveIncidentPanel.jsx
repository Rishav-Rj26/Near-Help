import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageCircle, CheckCircle, Zap, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket';

import ChatThread from './ChatThread';
import CrisisGuidanceCard from './CrisisGuidanceCard';
import EmergencySummaryCard from './EmergencySummaryCard';

const CRISIS_COLORS = {
  medical: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  fire: { bg: 'from-red-500 to-red-600', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
  gas_leak: { bg: 'from-orange-500 to-orange-600', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  accident: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  threat: { bg: 'from-rose-600 to-rose-700', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  other: { bg: 'from-slate-500 to-slate-600', text: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
};

export default function ActiveIncidentPanel({ incident, onClose, onResolved }) {
  const { user } = useAuth();
  const [responders, setResponders] = useState(incident.responders || []);
  const [hasJoined, setHasJoined] = useState(false);
  const [activeChatResponderId, setActiveChatResponderId] = useState(null);
  const [aiGuidance, setAiGuidance] = useState(incident.aiGuidance || null);
  const [aiSummary, setAiSummary] = useState(incident.aiSummary || null);
  const [nearbyServices, setNearbyServices] = useState(incident.nearbyServices || []);
  const [aiLoading, setAiLoading] = useState(!incident.aiGuidance);

  const incidentId = incident.incidentId || incident._id;
  const isBroadcaster = incident.broadcaster?.toString() === user?.id || incident.broadcaster === user?.id;
  const colors = CRISIS_COLORS[incident.crisisType] || CRISIS_COLORS.other;

  useEffect(() => {
    const already = responders.some(r => (r.user?.toString() === user?.id) || (r.user === user?.id) || (r.id === user?.id));
    setHasJoined(already);
    if (already && !isBroadcaster) setActiveChatResponderId(user.id);
  }, [responders, user, isBroadcaster]);

  useEffect(() => {
    const handle = (data) => {
      if (data.incidentId === incidentId) {
        setResponders(prev => {
          const exists = prev.some(r => (r.id === data.responder.id) || (r.user?.toString() === data.responder.id));
          return exists ? prev : [...prev, data.responder];
        });
      }
    };
    socketService.onResponderJoined(handle);
    return () => socketService.offResponderJoined(handle);
  }, [incidentId]);

  useEffect(() => {
    const handle = (data) => { if (data.incidentId === incidentId) { onResolved?.(incidentId); onClose?.(); } };
    socketService.onSOSResolved(handle);
    return () => socketService.offSOSResolved(handle);
  }, [incidentId, onResolved, onClose]);

  useEffect(() => {
    const handle = (data) => {
      if (data.incidentId === incidentId) {
        setAiGuidance(data.aiGuidance);
        setAiSummary(data.aiSummary);
        if (data.nearbyServices) setNearbyServices(data.nearbyServices);
        setAiLoading(false);
      }
    };
    socketService.onAIReady(handle);
    return () => socketService.offAIReady(handle);
  }, [incidentId]);

  const ticketNum = incidentId?.toString().slice(-3) || '000';
  const radiusLabel = incident.radius >= 1000 ? `${incident.radius / 1000}km` : `${incident.radius}m`;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-[1100] max-h-[85vh] overflow-y-auto glass rounded-t-3xl shadow-2xl shadow-black/50"
    >
      <div className="max-w-2xl mx-auto p-6 flex flex-col gap-5">
        {/* Drag indicator */}
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto -mt-1 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">Ticket #{ticketNum}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors.badge}`}>
                  {incident.crisisType.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-slate-400">Radius: {radiusLabel}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reporter */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 text-sm">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-white font-medium">
            {incident.isAnonymous ? 'Anonymous reporter' : (incident.broadcasterName || 'Reporter')}
          </span>
        </div>

        {/* Responders */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Responders</h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">{responders.length}</span>
          </div>
          {responders.length === 0 && <p className="text-sm text-slate-500 italic">Waiting for responders...</p>}
          <div className="flex flex-col gap-2">
            {responders.map(r => {
              const rId = r.id || r.user?.toString() || r.user;
              return (
                <motion.div
                  key={rId}
                  whileHover={{ x: 4 }}
                  onClick={() => isBroadcaster && setActiveChatResponderId(rId)}
                  className={`flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 transition-all ${isBroadcaster ? 'cursor-pointer hover:bg-slate-800/50 hover:border-indigo-500/30' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold">
                      {(r.name || 'R')[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-medium">{r.name || 'Responder'}</span>
                  </div>
                  {r.hasRelevantSkill && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {r.topSkill || 'Skilled'}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* AI & Services */}
        <CrisisGuidanceCard steps={aiGuidance?.steps} loading={aiLoading} />
        {!aiLoading && aiSummary && <EmergencySummaryCard summary={aiSummary?.summary} />}

        {!aiLoading && nearbyServices.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Nearby Services</h3>
            <div className="flex flex-col gap-2">
              {nearbyServices.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-sm font-medium text-white">{service.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{service.type.replace('_', ' ')}</div>
                    </div>
                  </div>
                  {service.phone && <span className="text-xs text-indigo-300 font-mono">{service.phone}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        {activeChatResponderId && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Chat {isBroadcaster ? 'with responder' : 'with broadcaster'}
              </h3>
            </div>
            <ChatThread
              incidentId={incidentId}
              responderId={activeChatResponderId}
              currentUserId={user.id}
              isAnonymous={incident.isAnonymous}
              broadcasterId={incident.broadcaster?.toString() || incident.broadcaster}
            />
          </div>
        )}

        {/* Actions */}
        <div className="pb-2">
          {isBroadcaster ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => socketService.resolveIncident(incidentId)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Resolved
            </motion.button>
          ) : !hasJoined ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { socketService.joinAsResponder(incidentId); setHasJoined(true); setActiveChatResponderId(user.id); }}
              className="w-full py-3.5 rounded-xl gradient-brand text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              I'm Responding
            </motion.button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
