import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../../services/socket';
import { fetchChatMessages } from '../../services/api';

export default function ChatThread({
  incidentId,
  responderId,
  currentUserId,
  isAnonymous = false,
  broadcasterId,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await fetchChatMessages(incidentId, responderId);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    loadHistory();
  }, [incidentId, responderId]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (msg.incidentId === incidentId && msg.responderId === responderId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socketService.onChatMessageNew(handleNewMessage);
    return () => socketService.offChatMessageNew(handleNewMessage);
  }, [incidentId, responderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    socketService.sendChatMessage(incidentId, responderId, text);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderLabel = (senderId) => {
    if (isAnonymous && senderId === broadcasterId) {
      return 'Anonymous reporter';
    }
    return senderId === currentUserId ? 'You' : 'Other';
  };

  return (
    <div className="flex flex-col h-[300px] bg-slate-950 border-[3px] border-slate-800 rounded-none overflow-hidden mt-2">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {messages.map((msg, i) => {
          const isOwn = (msg.sender === currentUserId) || (msg.sender?._id === currentUserId);
          return (
            <div key={msg._id || i} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <span className="font-mono text-[10px] text-slate-400 mb-1 uppercase tracking-widest">
                {getSenderLabel(msg.sender?._id || msg.sender)}
              </span>
              <div 
                className={`max-w-[80%] px-4 py-2 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words border-2 ${
                  isOwn 
                    ? 'bg-blue-600 border-blue-600 text-white rounded-t-lg rounded-bl-lg' 
                    : 'bg-slate-800 border-slate-700 text-slate-200 rounded-t-lg rounded-br-lg'
                }`}
              >
                {msg.text}
              </div>
              <span className="font-mono text-[10px] text-slate-500 mt-1">
                {formatTime(msg.sentAt)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex border-t-[3px] border-slate-800 p-2 gap-2 bg-slate-900">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 border-[2px] border-slate-700 bg-slate-950 text-white p-2 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button 
          onClick={handleSend} 
          disabled={!input.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white border-[2px] border-blue-600 hover:border-blue-400 px-4 font-black uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
