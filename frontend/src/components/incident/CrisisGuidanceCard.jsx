import React from 'react';
import { styled, keyframes } from '../../styles/theme';
import { TicketLabel } from '../ui/TicketCard.stitch';

const pulse = keyframes({
  '0%': { opacity: 0.6 },
  '50%': { opacity: 1 },
  '100%': { opacity: 0.6 },
});

const GuidanceContainer = styled('div', {
  backgroundColor: '$surfaceLight',
  borderRadius: '$md',
  padding: '$sm $md',
  marginBottom: '$md',
});

const GuidanceStep = styled('div', {
  fontSize: '$subtitle',
  color: '$ink',
  lineHeight: 1.6,
  marginBottom: '$xs',
  '&:last-child': {
    marginBottom: 0,
  },
  '& span': {
    fontFamily: '$mono',
    color: '$crisisMedical',
    marginRight: '$xs',
  },
});

const LoadingState = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$xs',
  animation: `${pulse} 1.5s ease-in-out infinite`,
});

const SkeletonLine = styled('div', {
  height: '14px',
  backgroundColor: '#E8EAED',
  borderRadius: '2px',
  variants: {
    width: {
      full: { width: '100%' },
      long: { width: '85%' },
      short: { width: '60%' },
    }
  },
  defaultVariants: {
    width: 'full'
  }
});

export default function CrisisGuidanceCard({ steps, loading }) {
  return (
    <GuidanceContainer>
      <TicketLabel>AI first-response guidance</TicketLabel>
      {loading ? (
        <LoadingState>
          <SkeletonLine width="full" />
          <SkeletonLine width="long" />
          <SkeletonLine width="short" />
        </LoadingState>
      ) : (
        steps?.map((step, i) => (
          <GuidanceStep key={i}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            {step}
          </GuidanceStep>
        ))
      )}
    </GuidanceContainer>
  );
}
