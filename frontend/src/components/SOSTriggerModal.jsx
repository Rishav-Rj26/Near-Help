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

const CRISIS_TYPES = ['medical', 'fire', 'gas_leak', 'accident', 'threat', 'other'];
const RADII = [500, 1000, 2000];

export default function SOSTriggerModal({ isOpen, onClose, onSubmit, location }) {
  const [selectedType, setSelectedType] = useState('medical');
  const [selectedRadius, setSelectedRadius] = useState(1000);
  const [isAnonymous, setIsAnonymous] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      crisisType: selectedType,
      radius: selectedRadius,
      isAnonymous: selectedType === 'threat' ? isAnonymous : false,
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

        <Button intent="sos" size="block" onClick={handleSubmit}>
          BROADCAST SOS
        </Button>
      </ModalSheet>
    </ModalOverlay>
  );
}
