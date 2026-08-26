import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket';

import ChatThread from './ChatThread';
import CrisisGuidanceCard from './CrisisGuidanceCard';
import EmergencySummaryCard from './EmergencySummaryCard';

const CRISIS_COLORS = {
  medical: 'bg-blue-500',
  fire: 'bg-red-500',
  gas_leak: 'bg-orange-500',
  accident: 'bg-purple-500',
  threat: 'bg-rose-800',
  other: 'bg-slate-500',
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

  useEffect(() => {
    const alreadyResponder = responders.some(
      (r) => (r.user?.toString() === user?.id) || (r.user === user?.id) || (r.id === user?.id)
    );
    setHasJoined(alreadyResponder);

    if (alreadyResponder && !isBroadcaster) {
      setActiveChatResponderId(user.id);
    }
  }, [responders, user, isBroadcaster]);

  useEffect(() => {
    const handleResponderJoined = (data) => {
      if (data.incidentId === incidentId) {
        setResponders((prev) => {
          const exists = prev.some(
            (r) => (r.id === data.responder.id) || (r.user?.toString() === data.responder.id)
          );
          if (exists) return prev;
          return [...prev, data.responder];
        });
      }
    };
    socketService.onResponderJoined(handleResponderJoined);
    return () => socketService.offResponderJoined(handleResponderJoined);
  }, [incidentId]);

  useEffect(() => {
    const handleResolved = (data) => {
      if (data.incidentId === incidentId) {
        onResolved?.(incidentId);
        onClose?.();
      }
    };
    socketService.onSOSResolved(handleResolved);
    return () => socketService.offSOSResolved(handleResolved);
  }, [incidentId, onResolved, onClose]);

  useEffect(() => {
    const handleAIReady = (data) => {
      if (data.incidentId === incidentId) {
        setAiGuidance(data.aiGuidance);
        setAiSummary(data.aiSummary);
        if (data.nearbyServices) setNearbyServices(data.nearbyServices);
        setAiLoading(false);
      }
    };
    socketService.onAIReady(handleAIReady);
    return () => socketService.offAIReady(handleAIReady);
  }, [incidentId]);

  const handleJoin = () => {
    socketService.joinAsResponder(incidentId);
    setHasJoined(true);
    setActiveChatResponderId(user.id);
  };

  const handleResolve = () => {
    socketService.resolveIncident(incidentId);
  };

  const ticketNum = incidentId?.toString().slice(-3) || '000';
  const radiusLabel = incident.radius >= 1000 ? `${incident.radius / 1000}km` : `${incident.radius}m`;
  const typeColor = CRISIS_COLORS[incident.crisisType] || CRISIS_COLORS.other;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1100] max-h-[85vh] overflow-y-auto bg-slate-900 border-t-[3px] border-white shadow-[0_-8px_0px_0px_rgba(255,255,255,0.1)] p-4 sm:p-6 transition-transform animate-in slide-in-from-bottom">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-4">
          <span className="font-mono font-bold text-white uppercase tracking-widest">Ticket #{ticketNum}</span>
          <button onClick={onClose} className="text-3xl text-slate-400 hover:text-white leading-none">&times;</button>
        </div>

        {/* Tags & Reporter */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <span className={`px-2 py-1 text-xs font-black uppercase tracking-widest text-white ${typeColor}`}>
              {incident.crisisType.replace('_', ' ')}
            </span>
            <span className="px-2 py-1 text-xs font-black uppercase tracking-widest border border-slate-600 text-slate-400">
              {radiusLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-white py-2 border-b border-slate-800">
            <span>&#128065;</span>
            <span>{incident.isAnonymous ? 'Anonymous reporter' : (incident.broadcasterName || 'Reporter')}</span>
          </div>
        </div>

        {/* Responders */}
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2 mt-4">
            Responders &middot; {responders.length}
          </h3>
          {responders.length === 0 && (
            <div className="text-sm font-mono text-slate-500 py-2">No responders yet</div>
          )}
          <div className="flex flex-col gap-2">
            {responders.map((r) => {
              const rId = r.id || r.user?.toString() || r.user;
              const rName = r.name || 'Responder';
              return (
                <div 
                  key={rId}
                  onClick={() => isBroadcaster && setActiveChatResponderId(rId)}
                  className={`flex items-center justify-between p-3 bg-slate-950 border border-slate-800 transition-colors ${isBroadcaster ? 'cursor-pointer hover:border-slate-500' : ''}`}
                >
                  <span className="font-bold text-white text-sm">{rName}</span>
                  {r.hasRelevantSkill && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500 text-xs font-black uppercase tracking-widest">
                      {r.topSkill || 'Skilled'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI & Services */}
        <CrisisGuidanceCard steps={aiGuidance?.steps} loading={aiLoading} />
        {!aiLoading && aiSummary && <EmergencySummaryCard summary={aiSummary?.summary} />}

        {!aiLoading && nearbyServices.length > 0 && (
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2 mt-4">
              Nearby Services
            </h3>
            <div className="flex flex-col gap-2">
              {nearbyServices.map((service, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 text-sm">
                  <div className="font-bold text-white">{service.name}</div>
                  <div className="flex justify-between mt-1 font-mono text-xs text-slate-400">
                    <span className="uppercase">{service.type.replace('_', ' ')}</span>
                    <span>{service.phone || 'No phone'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Thread */}
        {activeChatResponderId && (
          <div className="mt-4 pt-4 border-t-2 border-slate-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
              Chat {isBroadcaster ? `with responder` : 'with broadcaster'}
            </h3>
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
        <div className="mt-4">
          {isBroadcaster ? (
            <button 
              onClick={handleResolve}
              className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-black text-sm tracking-widest uppercase border-[3px] border-green-600 hover:border-white transition-all"
            >
              Mark Resolved
            </button>
          ) : !hasJoined ? (
            <button 
              onClick={handleJoin}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-widest uppercase border-[3px] border-blue-600 hover:border-white transition-all"
            >
              I'm Responding
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
