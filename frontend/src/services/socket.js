import { io } from 'socket.io-client';

// VITE_API_URL is the REST base (for example, http://localhost:3001/api).
// Socket.IO is served from the server origin, not beneath the REST prefix.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = new URL(API_URL, window.location.origin).origin;

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ── Phase 1 ──
  triggerSOS(payload) {
    if (this.socket) {
      this.socket.emit('sos:trigger', payload);
    }
  }

  updateLocation(lng, lat) {
    if (this.socket) {
      this.socket.emit('location:update', { lng, lat });
    }
  }

  onSOSNew(callback) {
    if (this.socket) {
      this.socket.on('sos:new', callback);
    }
  }
  
  onSOSTriggered(callback) {
    if (this.socket) {
      this.socket.on('sos:triggered', callback);
    }
  }

  offSOSTriggered(callback) {
    if (this.socket) {
      this.socket.off('sos:triggered', callback);
    }
  }

  offSOSNew(callback) {
    if (this.socket) {
      this.socket.off('sos:new', callback);
    }
  }

  // ── Phase 2: Responder ──
  joinAsResponder(incidentId) {
    if (this.socket) {
      this.socket.emit('responder:join', { incidentId });
    }
  }

  sendResponderLocation(incidentId, lng, lat) {
    if (this.socket) {
      this.socket.emit('responder:location', { incidentId, lng, lat });
    }
  }

  onResponderJoined(callback) {
    if (this.socket) {
      this.socket.on('responder:joined', callback);
    }
  }

  offResponderJoined(callback) {
    if (this.socket) {
      this.socket.off('responder:joined', callback);
    }
  }

  onResponderLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('responder:location:update', callback);
    }
  }

  offResponderLocationUpdate(callback) {
    if (this.socket) {
      this.socket.off('responder:location:update', callback);
    }
  }

  // ── Phase 2: Chat ──
  sendChatMessage(incidentId, responderId, text) {
    if (this.socket) {
      this.socket.emit('chat:message', { incidentId, responderId, text });
    }
  }

  onChatMessageNew(callback) {
    if (this.socket) {
      this.socket.on('chat:message:new', callback);
    }
  }

  offChatMessageNew(callback) {
    if (this.socket) {
      this.socket.off('chat:message:new', callback);
    }
  }

  // ── Phase 2: Resolve ──
  resolveIncident(incidentId) {
    if (this.socket) {
      this.socket.emit('sos:resolve', { incidentId });
    }
  }

  onSOSResolved(callback) {
    if (this.socket) {
      this.socket.on('sos:resolved', callback);
    }
  }

  offSOSResolved(callback) {
    if (this.socket) {
      this.socket.off('sos:resolved', callback);
    }
  }

  // ── Phase 3: AI & Debrief ──
  onAIReady(callback) {
    if (this.socket) {
      this.socket.on('sos:ai_ready', callback);
    }
  }

  offAIReady(callback) {
    if (this.socket) {
      this.socket.off('sos:ai_ready', callback);
    }
  }

  onDebriefReady(callback) {
    if (this.socket) {
      this.socket.on('sos:debrief_ready', callback);
    }
  }

  offDebriefReady(callback) {
    if (this.socket) {
      this.socket.off('sos:debrief_ready', callback);
    }
  }

  // ── Generic error listener ──
  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  offError(callback) {
    if (this.socket) {
      this.socket.off('error', callback);
    }
  }

  // ── Connection state listeners ──
  onReconnect(callback) {
    if (this.socket) {
      this.socket.io.on('reconnect', callback);
    }
  }

  offReconnect(callback) {
    if (this.socket) {
      this.socket.io.off('reconnect', callback);
    }
  }
}

export const socketService = new SocketService();
