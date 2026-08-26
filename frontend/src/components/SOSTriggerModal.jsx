import React, { useState } from 'react';
import { ModalOverlay, ModalSheet, ModalTitle } from './ui/Modal.stitch';
import { CrisisTag } from './ui/TriageTag.stitch';
import { RadiusChip } from './ui/RadiusChip.stitch';
import { Button } from './ui/Button.stitch';
import { styled } from '../styles/theme';

const FlexRow = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$md',
  marginBottom: '$lg',
});

const ToggleContainer = styled('label', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$sm $md',
  backgroundColor: '$surfaceLight',
  borderRadius: '$md',
  cursor: 'pointer',
  marginBottom: '$lg',
});

const TextArea = styled('textarea', {
  width: '100%',
  minHeight: '60px',
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

const CRISIS_TYPES = ['medical', 'fire', 'gas_leak', 'accident', 'threat', 'other'];
const RADII = [500, 1000, 2000];

export default function SOSTriggerModal({ isOpen, onClose, onSubmit, location }) {
  const [selectedType, setSelectedType] = useState('medical');
  const [selectedRadius, setSelectedRadius] = useState(1000);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      crisisType: selectedType,
      radius: selectedRadius,
      isAnonymous: selectedType === 'threat' ? isAnonymous : false,
      details: details.trim(),
      location,
    });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalSheet onClick={e => e.stopPropagation()}>
        <ModalTitle>Trigger SOS</ModalTitle>
        
        <h3 style={{ fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', color: '#5B6B7C' }}>Crisis Type</h3>
        <FlexRow>
          {CRISIS_TYPES.map(type => (
            <div 
              key={type} 
              onClick={() => setSelectedType(type)}
              style={{ cursor: 'pointer', opacity: selectedType === type ? 1 : 0.5, transition: 'opacity 0.2s' }}
            >
              <CrisisTag crisisType={type} />
            </div>
          ))}
        </FlexRow>

        <h3 style={{ fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', color: '#5B6B7C' }}>Broadcast Radius</h3>
        <FlexRow>
          {RADII.map(r => (
            <div key={r} onClick={() => setSelectedRadius(r)} style={{ cursor: 'pointer' }}>
              <RadiusChip active={selectedRadius === r}>
                {r >= 1000 ? `${r/1000}km` : `${r}m`}
              </RadiusChip>
            </div>
          ))}
        </FlexRow>

        {selectedType === 'threat' && (
          <ToggleContainer>
            <span style={{ fontWeight: 600 }}>Send Anonymously</span>
            <input 
              type="checkbox" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)} 
              style={{ width: '20px', height: '20px' }}
            />
          </ToggleContainer>
        )}

        <h3 style={{ fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', color: '#5B6B7C' }}>Additional Details (Optional)</h3>
        <TextArea 
          placeholder="e.g., Number of injured, suspicious vehicle description..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        <Button intent="sos" size="block" onClick={handleSubmit}>
          BROADCAST SOS
        </Button>
      </ModalSheet>
    </ModalOverlay>
  );
}
