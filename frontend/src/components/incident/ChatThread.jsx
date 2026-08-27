import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { socketService } from '../../services/socket';
import { fetchChatMessages } from '../../services/api';

export default function ChatThread({ incidentId, responderId, currentUserId, isAnonymous = false, broadcasterId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await fetchChatMessages(incidentId, responderId);
        setMessages(data);
      } catch (err) { console.error('Failed to load chat:', err); }
    };
    loadHistory();
  }, [incidentId, responderId]);

  useEffect(() => {
    const handle = (msg) => {
      if (msg.incidentId === incidentId && msg.responderId === responderId) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socketService.onChatMessageNew(handle);
    return () => socketService.offChatMessageNew(handle);
  }, [incidentId, responderId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    socketService.sendChatMessage(incidentId, responderId, text);
    setInput('');
  };

  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getSenderLabel = (senderId) => {
    if (isAnonymous && senderId === broadcasterId) return 'Anonymous';
    return senderId === currentUserId ? 'You' : 'Other';
  };

  return (
    <div className="flex flex-col h-[280px] rounded-xl overflow-hidden border border-slate-700/30 bg-slate-900/50">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500 italic">No messages yet</div>
        )}
        {messages.map((msg, i) => {
          const isOwn = (msg.sender === currentUserId) || (msg.sender?._id === currentUserId);
          return (
            <div key={msg._id || i} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-slate-500 font-medium mb-1">{getSenderLabel(msg.sender?._id || msg.sender)}</span>
              <div className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed break-words ${
                isOwn
                  ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md'
                  : 'bg-slate-800 text-slate-200 rounded-2xl rounded-bl-md border border-slate-700/30'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-600 mt-1 font-mono">{formatTime(msg.sentAt)}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex border-t border-slate-700/30 p-2 gap-2 bg-slate-800/30">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          className="flex-1 bg-slate-900/50 border border-slate-700/30 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25 transition-shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
