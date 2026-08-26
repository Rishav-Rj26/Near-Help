import React, { useState, useEffect } from 'react';
import { styled } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket';

import { TicketCard, TicketRow, TicketLabel, TicketNumber } from '../ui/TicketCard.stitch';
import { CrisisTag, TriageTag } from '../ui/TriageTag.stitch';
import { Button } from '../ui/Button.stitch';
import ChatThread from './ChatThread';

const PanelOverlay = styled('div', {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
  maxHeight: '85vh',
  overflowY: 'auto',
  borderRadius: '$lg $lg 0 0',
  boxShadow: '0 -4px 24px rgba(11, 31, 51, 0.25)',
});

const Header = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$md',
});

const CloseButton = styled('button', {
  background: 'none',
  border: 'none',
  fontSize: '22px',
  cursor: 'pointer',
  color: '$slate',
  padding: '$xs',
  lineHeight: 1,
});

const BroadcasterRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$sm',
  padding: '$sm 0',
  borderTop: '1px solid rgba(11, 31, 51, 0.1)',
  borderBottom: '1px solid rgba(11, 31, 51, 0.1)',
  marginBottom: '$md',
  fontSize: '$subtitle',
});

const GuidanceCard = styled('div', {
  backgroundColor: '$surfaceLight',
  borderRadius: '$md',
  padding: '$sm $md',
  marginBottom: '$md',
});

const GuidanceStep = styled('div', {
  fontSize: '$subtitle',
  color: '$ink',
  lineHeight: 1.6,
  '& span': {
    fontFamily: '$mono',
    color: '$crisisMedical',
    marginRight: '$xs',
  },
});

const SectionTitle = styled('div', {
  fontSize: '$caption',
  color: '$slate',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  marginBottom: '$xs',
  marginTop: '$md',
});

const ResponderListItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$sm $md',
  backgroundColor: '$surfaceLight',
  borderRadius: '$md',
  marginBottom: '$sm',
  fontSize: '$subtitle',
  cursor: 'pointer',
  transition: 'background-color 200ms ease',
  '&:hover': { backgroundColor: '#ECF0E8' },
});

const ChatSection = styled('div', {
  marginTop: '$md',
  borderTop: '1px solid rgba(11, 31, 51, 0.1)',
  paddingTop: '$md',
});

/**
 * ActiveIncidentPanel
 * 
 * Renders in two modes:
 * - broadcaster: sees responders list, per-responder chat, resolve button
 * - responder: sees incident info, "I'm Responding" or chat if already joined
 */
export default function ActiveIncidentPanel({ incident, onClose, onResolved }) {
  const { user } = useAuth();
  const [responders, setResponders] = useState(incident.responders || []);
  const [hasJoined, setHasJoined] = useState(false);
  const [activeChatResponderId, setActiveChatResponderId] = useState(null);

  const incidentId = incident.incidentId || incident._id;
  const isBroadcaster = incident.broadcaster?.toString() === user?.id ||
                         incident.broadcaster === user?.id;

  // Check if current user already joined as responder
  useEffect(() => {
    const alreadyResponder = responders.some(
      (r) => (r.user?.toString() === user?.id) || (r.user === user?.id) || (r.id === user?.id)
    );
    setHasJoined(alreadyResponder);

    // If user is a responder, auto-open their chat thread
    if (alreadyResponder && !isBroadcaster) {
      setActiveChatResponderId(user.id);
    }
  }, [responders, user, isBroadcaster]);

  // Listen for new responders joining
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

  // Listen for resolve
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

  const handleJoin = () => {
    socketService.joinAsResponder(incidentId);
    setHasJoined(true);
    setActiveChatResponderId(user.id);
  };

  const handleResolve = () => {
    socketService.resolveIncident(incidentId);
  };

  const ticketNum = incidentId?.toString().slice(-3) || '000';

  // AI guidance placeholder for Phase 3
  const guidanceSteps = [
    'Check responsiveness and breathing',
    'Call emergency services if not already done',
  ];

  return (
    <PanelOverlay>
      <TicketCard>
        <Header>
          <CloseButton onClick={onClose} aria-label="Close panel">&times;</CloseButton>
          <TicketNumber>TICKET #{ticketNum}</TicketNumber>
        </Header>

        <div style={{ marginBottom: '14px' }}>
          <CrisisTag
            crisisType={incident.crisisType}
            radiusLabel={incident.radius >= 1000 ? `${incident.radius / 1000}km` : `${incident.radius}m`}
          />
        </div>

        <BroadcasterRow>
          <span aria-hidden="true">&#128065;</span>
          <span>
            {incident.isAnonymous ? 'Anonymous reporter' : (incident.broadcasterName || 'Reporter')}
          </span>
        </BroadcasterRow>

        {/* Responders section */}
        <SectionTitle>Responders &middot; {responders.length}</SectionTitle>
        {responders.length === 0 && (
          <div style={{ fontSize: '13px', color: '#5B6B7C', padding: '8px 0' }}>
            No responders yet
          </div>
        )}
        {responders.map((r) => {
          const rId = r.id || r.user?.toString() || r.user;
          const rName = r.name || 'Responder';
          return (
            <ResponderListItem
              key={rId}
              onClick={() => isBroadcaster && setActiveChatResponderId(rId)}
            >
              <span>{rName}</span>
              {r.hasRelevantSkill && <TriageTag tone="skill">Skilled</TriageTag>}
            </ResponderListItem>
          );
        })}

        {/* AI Guidance placeholder */}
        <GuidanceCard>
          <TicketLabel>AI first-response guidance</TicketLabel>
          {guidanceSteps.map((step, i) => (
            <GuidanceStep key={step}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {step}
            </GuidanceStep>
          ))}
        </GuidanceCard>

        {/* Chat thread */}
        {activeChatResponderId && (
          <ChatSection>
            <TicketLabel>
              Chat {isBroadcaster ? `with responder` : 'with broadcaster'}
            </TicketLabel>
            <ChatThread
              incidentId={incidentId}
              responderId={activeChatResponderId}
              currentUserId={user.id}
              isAnonymous={incident.isAnonymous}
              broadcasterId={incident.broadcaster?.toString() || incident.broadcaster}
            />
          </ChatSection>
        )}

        {/* Action button */}
        <div style={{ marginTop: '16px' }}>
          {isBroadcaster ? (
            <Button intent="resolve" size="block" onClick={handleResolve}>
              Mark resolved
            </Button>
          ) : !hasJoined ? (
            <Button intent="respond" size="block" onClick={handleJoin}>
              I'm Responding
            </Button>
          ) : null}
        </div>
      </TicketCard>
    </PanelOverlay>
  );
}
