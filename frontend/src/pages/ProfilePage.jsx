import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { fetchCurrentUser, updateUserSkills } from '../services/api';
import { Button } from '../components/ui/Button.stitch';
import { TriageTag } from '../components/ui/TriageTag.stitch';

const VALID_SKILLS = [
  'CPR',
  'First Aid',
  'Doctor',
  'Nurse',
  'Paramedic',
  'Firefighter',
  'Lifeguard',
  'Mental Health First Aid',
];

const Container = styled('div', {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '$xl $md',
});

const Header = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$xl',
});

const Title = styled('h1', {
  fontSize: '24px',
  color: '$ink',
  margin: 0,
});

const Section = styled('div', {
  backgroundColor: '$surfaceLight',
  borderRadius: '$md',
  padding: '$md',
  marginBottom: '$lg',
});

const SectionTitle = styled('h2', {
  fontSize: '$subtitle',
  color: '$slate',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: '0 0 $md 0',
});

const StatsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '$md',
});

const StatBox = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

const StatValue = styled('span', {
  fontSize: '28px',
  fontWeight: 700,
  color: '$signal',
});

const StatLabel = styled('span', {
  fontSize: '$caption',
  color: '$slate',
});

const SkillsGrid = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$sm',
});

const SkillChip = styled('button', {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  transition: 'transform 0.1s ease',
  '&:active': {
    transform: 'scale(0.95)',
  }
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await fetchCurrentUser();
      setProfile(data.user);
      setStats(data.stats);
      setSkills(data.user.skills || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = async (skill) => {
    let newSkills;
    if (skills.includes(skill)) {
      newSkills = skills.filter(s => s !== skill);
    } else {
      newSkills = [...skills, skill];
    }
    
    // Optimistic update
    setSkills(newSkills);
    
    try {
      await updateUserSkills(newSkills);
    } catch (error) {
      console.error('Failed to update skills:', error);
      // Revert on error
      setSkills(skills);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading) return null;

  return (
    <Container>
      <Header>
        <Title>{profile?.name ? `${profile.name}'s Profile` : 'Profile'}</Title>
        <Button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid #E8EAED', color: '#0B1F33' }}>
          Back to Map
        </Button>
      </Header>

      <Section>
        <SectionTitle>My Impact</SectionTitle>
        <StatsGrid>
          <StatBox>
            <StatValue>{stats?.responseCount || 0}</StatValue>
            <StatLabel>Responses</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0'}★</StatValue>
            <StatLabel>Avg Rating</StatLabel>
          </StatBox>
        </StatsGrid>
      </Section>

      <Section>
        <SectionTitle>My Skills</SectionTitle>
        <p style={{ fontSize: '13px', color: '#5B6B7C', marginBottom: '16px', marginTop: 0 }}>
          Select the skills you possess. These will be shown to other responders when you join an incident.
        </p>
        <SkillsGrid>
          {VALID_SKILLS.map(skill => {
            const isSelected = skills.includes(skill);
            return (
              <SkillChip key={skill} onClick={() => toggleSkill(skill)}>
                <TriageTag tone={isSelected ? "skill" : "skillOutline"}>
                  {skill}
                </TriageTag>
              </SkillChip>
            );
          })}
        </SkillsGrid>
      </Section>

      <Button size="block" intent="primary" style={{ backgroundColor: '#FBE9E7', color: '#D93025' }} onClick={handleLogout}>
        Sign Out
      </Button>
    </Container>
  );
}
