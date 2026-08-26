import React, { useState } from 'react';
import { styled } from '../../../styles/theme';
import { ModalOverlay, ModalSheet, ModalTitle } from '../ui/Modal.stitch';
import { Button } from '../ui/Button.stitch';
import { TriageTag } from '../ui/TriageTag.stitch';
import { submitDebrief, rateResponder } from '../../../services/api';

const QuestionLabel = styled('label', {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '$ink',
  marginBottom: '$sm',
});

const TextArea = styled('textarea', {
  width: '100%',
  minHeight: '80px',
  padding: '$sm',
  borderRadius: '$sm',
  border: '1px solid #5B6B7C',
  backgroundColor: 'transparent',
  color: '$ink',
  fontFamily: '$body',
  fontSize: '14px',
  marginBottom: '$lg',
  resize: 'vertical',
  '&:focus': {
    outline: 'none',
    borderColor: '$signal',
  },
});

const ToggleContainer = styled('div', {
  display: 'flex',
  gap: '$md',
  marginBottom: '$lg',
});

const ToggleButton = styled('button', {
  flex: 1,
  padding: '$sm',
  borderRadius: '$sm',
  border: '1px solid #5B6B7C',
  backgroundColor: 'transparent',
  color: '$ink',
  fontFamily: '$body',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
  variants: {
    active: {
      yes: {
        backgroundColor: '$verified',
        color: '#04241A',
        borderColor: '$verified',
      },
      no: {
        backgroundColor: '$alert',
        color: '#3D0A08',
        borderColor: '$alert',
      }
    }
  }
});

const SectionTitle = styled('div', {
  fontSize: '$caption',
  color: '$slate',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  marginBottom: '$xs',
  marginTop: '$md',
});

const ResponderRatingRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$sm $md',
  backgroundColor: '$surfaceLight',
  borderRadius: '$md',
  marginBottom: '$sm',
});

const StarsContainer = styled('div', {
  display: 'flex',
  gap: '4px',
});

const StarBtn = styled('button', {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '18px',
  padding: '0 2px',
  color: '#E8EAED', // default dim
  variants: {
    active: {
      true: { color: '$signal' }
    }
  }
});

export default function DebriefModal({ incidentId, questions, responders, onClose }) {
  const [wasReal, setWasReal] = useState(null);
  const [answers, setAnswers] = useState(questions.map(() => ''));
  const [ratings, setRatings] = useState({}); // { responderId: rating }
  const [submitting, setSubmitting] = useState(false);

  const handleStarClick = (responderId, rating) => {
    setRatings(prev => ({ ...prev, [responderId]: rating }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Combine answers into a single notes string
      const notes = questions.map((q, i) => `Q: ${q}\nA: ${answers[i] || 'N/A'}`).join('\n\n');
      
      // 2. Submit debrief
      await submitDebrief(incidentId, { wasReal: wasReal === true, notes });

      // 3. Submit ratings concurrently
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
    <ModalOverlay>
      <ModalSheet onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ModalTitle style={{ marginBottom: 0 }}>Incident Debrief</ModalTitle>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#5B6B7C', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Skip
          </button>
        </div>
        
        <p style={{ fontSize: '13px', color: '#5B6B7C', marginBottom: '24px' }}>
          Your feedback helps improve community safety and responder trust.
        </p>

        <QuestionLabel>Was this a real emergency?</QuestionLabel>
        <ToggleContainer>
          <ToggleButton 
            active={wasReal === true ? 'yes' : undefined} 
            onClick={() => setWasReal(true)}
          >
            Yes, it was real
          </ToggleButton>
          <ToggleButton 
            active={wasReal === false ? 'no' : undefined} 
            onClick={() => setWasReal(false)}
          >
            No, test/false alarm
          </ToggleButton>
        </ToggleContainer>

        {questions.map((q, i) => (
          <div key={i}>
            <QuestionLabel>{q}</QuestionLabel>
            <TextArea 
              value={answers[i]} 
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[i] = e.target.value;
                setAnswers(newAnswers);
              }}
              placeholder="Your answer..."
            />
          </div>
        ))}

        {responders && responders.length > 0 && (
          <>
            <SectionTitle>Rate Responders</SectionTitle>
            {responders.map(r => {
              const rId = r.id || r.user?.toString() || r.user;
              const rName = r.name || 'Responder';
              return (
                <ResponderRatingRow key={rId}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{rName}</span>
                    {r.hasRelevantSkill && <TriageTag tone="skill">Skilled</TriageTag>}
                  </div>
                  <StarsContainer>
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarBtn 
                        key={star}
                        active={(ratings[rId] || 0) >= star}
                        onClick={() => handleStarClick(rId, star)}
                      >
                        ★
                      </StarBtn>
                    ))}
                  </StarsContainer>
                </ResponderRatingRow>
              );
            })}
            <div style={{ marginBottom: '24px' }} />
          </>
        )}

        <Button 
          intent="respond" 
          size="block" 
          onClick={handleSubmit}
          disabled={submitting || wasReal === null}
        >
          {submitting ? 'Submitting...' : 'Submit Debrief'}
        </Button>
      </ModalSheet>
    </ModalOverlay>
  );
}
