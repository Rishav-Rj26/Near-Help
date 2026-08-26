import React, { useState } from 'react';
import { styled } from '../../styles/theme';
import { TicketLabel } from '../ui/TicketCard.stitch';

const SummaryContainer = styled('div', {
  backgroundColor: '$surfaceLight',
  borderRadius: '$md',
  padding: '$sm $md',
  marginBottom: '$md',
  position: 'relative',
});

const SummaryText = styled('p', {
  fontSize: '$subtitle',
  color: '$ink',
  lineHeight: 1.5,
  margin: 0,
});

const CopyButton = styled('button', {
  position: 'absolute',
  top: '$sm',
  right: '$sm',
  background: 'none',
  border: '1px solid #E8EAED',
  borderRadius: '$sm',
  padding: '4px 8px',
  fontSize: '10px',
  fontFamily: '$mono',
  color: '$slate',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '#E8EAED',
    color: '$ink',
  },
});

export default function EmergencySummaryCard({ summary }) {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <SummaryContainer>
      <TicketLabel>Emergency Summary (For Dispatcher)</TicketLabel>
      <SummaryText>{summary}</SummaryText>
      <CopyButton onClick={handleCopy}>
        {copied ? 'COPIED!' : 'COPY'}
      </CopyButton>
    </SummaryContainer>
  );
}
