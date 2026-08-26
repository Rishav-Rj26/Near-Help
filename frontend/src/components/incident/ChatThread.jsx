import React, { useState, useEffect, useRef } from 'react';
import { styled } from '../../styles/theme';
import { socketService } from '../../services/socket';
import { fetchChatMessages } from '../../services/api';

const ThreadContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '300px',
  backgroundColor: '$surfaceLight',
  borderRadius: '$md',
  overflow: 'hidden',
});

const MessagesArea = styled('div', {
  flex: 1,
  overflowY: 'auto',
  padding: '$sm',
  display: 'flex',
  flexDirection: 'column',
  gap: '$xs',
});

const Bubble = styled('div', {
  maxWidth: '75%',
  padding: '$sm $md',
  borderRadius: '$md',
  fontSize: '$subtitle',
  lineHeight: 1.5,
  wordBreak: 'break-word',

  variants: {
    align: {
      left: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8EAED',
        color: '$ink',
        borderBottomLeftRadius: '2px',
      },
      right: {
        alignSelf: 'flex-end',
        backgroundColor: '#D6E4F0',
        color: '$ink',
        borderBottomRightRadius: '2px',
      },
    },
  },
});

const Timestamp = styled('span', {
  fontFamily: '$mono',
  fontSize: '10px',
  color: '$slate',
  marginTop: '2px',
  display: 'block',
});

const SenderName = styled('span', {
  fontFamily: '$mono',
  fontSize: '10px',
  color: '$slate',
  marginBottom: '2px',
  display: 'block',
});

const InputRow = styled('div', {
  display: 'flex',
  borderTop: '1px solid #E8EAED',
  padding: '$xs',
  gap: '$xs',
});

const ChatInput = styled('input', {
  flex: 1,
  border: '1px solid #5B6B7C',
  borderRadius: '$sm',
  padding: '$xs $sm',
  fontFamily: '$body',
  fontSize: '$subtitle',
  backgroundColor: 'transparent',
  color: '$ink',
  '&:focus': {
    outline: 'none',
    borderColor: '$verified',
  },
});

const SendButton = styled('button', {
  backgroundColor: '$verified',
  color: '#04241A',
  border: 'none',
  borderRadius: '$sm',
  padding: '$xs $md',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: '$body',
  fontSize: '$subtitle',
  '&:disabled': { opacity: 0.5 },
});

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

  // Load chat history on mount
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

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (msg) => {
      // Only add messages for this specific responder thread
      if (msg.incidentId === incidentId && msg.responderId === responderId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socketService.onChatMessageNew(handleNewMessage);
    return () => socketService.offChatMessageNew(handleNewMessage);
  }, [incidentId, responderId]);

  // Auto-scroll to bottom
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
    <ThreadContainer>
      <MessagesArea>
        {messages.map((msg, i) => {
          const isOwn = (msg.sender === currentUserId) || (msg.sender?._id === currentUserId);
          return (
            <div key={msg._id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
              <SenderName>{getSenderLabel(msg.sender?._id || msg.sender)}</SenderName>
              <Bubble align={isOwn ? 'right' : 'left'}>
                {msg.text}
              </Bubble>
              <Timestamp>{formatTime(msg.sentAt)}</Timestamp>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </MessagesArea>
      <InputRow>
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <SendButton onClick={handleSend} disabled={!input.trim()}>
          Send
        </SendButton>
      </InputRow>
    </ThreadContainer>
  );
}
