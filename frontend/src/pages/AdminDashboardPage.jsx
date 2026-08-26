import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';
import { styled } from '../styles/theme';
import { 
  fetchActiveIncidents, 
  fetchAnalytics, 
  fetchFlaggedUsers, 
  suspendUser, 
  unsuspendUser 
} from '../services/api';

import { TicketCard, TicketLabel, TicketNumber } from '../components/ui/TicketCard.stitch';
import { Button } from '../components/ui/Button.stitch';
import PulsingPinMarker from '../components/map/PulsingPinMarker';

// Layout Styled Components
const DashboardLayout = styled('div', {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  backgroundColor: '$fog',
});

const Sidebar = styled('nav', {
  width: '240px',
  backgroundColor: '$ink',
  color: 'white',
  padding: '$xl $md',
  display: 'flex',
  flexDirection: 'column',
  gap: '$sm',
});

const SidebarTitle = styled('h1', {
  fontSize: '20px',
  margin: '0 0 $xl 0',
  padding: '0 $sm',
  color: '$signal',
  letterSpacing: '1px',
});

const SidebarItem = styled('a', {
  padding: '$sm',
  color: '$slate',
  textDecoration: 'none',
  borderRadius: '$sm',
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
  }
});

const MainContent = styled('main', {
  flex: 1,
  padding: '$xl',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '$xl',
});

const SectionTitle = styled('h2', {
  fontSize: '$display',
  color: '$ink',
  margin: '0 0 $md 0',
});

const StatsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '$lg',
});

const Table = styled('table', {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: 'white',
  borderRadius: '$md',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
});

const Th = styled('th', {
  textAlign: 'left',
  padding: '$md',
  borderBottom: '1px solid #E8EAED',
  backgroundColor: '$surfaceLight',
  color: '$slate',
  fontWeight: 600,
  fontSize: '13px',
});

const Td = styled('td', {
  padding: '$md',
  borderBottom: '1px solid #E8EAED',
  fontSize: '14px',
});

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({ activeCount: 0, avgResponseTimeSec: 0, flaggedUserCount: 0 });
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, incidentsRes, usersRes] = await Promise.all([
        fetchAnalytics(),
        fetchActiveIncidents(),
        fetchFlaggedUsers()
      ]);
      
      setAnalytics(analyticsRes.data);
      setActiveIncidents(incidentsRes.data);
      setFlaggedUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadDashboardData();
  }, [user?.role, loadDashboardData]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleToggleSuspend = async (userId, isSuspended) => {
    try {
      if (isSuspended) {
        await unsuspendUser(userId);
      } else {
        await suspendUser(userId);
      }
      // Refresh just the users and analytics
      const [usersRes, analyticsRes] = await Promise.all([
        fetchFlaggedUsers(),
        fetchAnalytics()
      ]);
      setFlaggedUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to toggle suspension', error);
      alert('Failed to update user status.');
    }
  };

  if (loading) return <div>Loading Admin Dashboard...</div>;

  return (
    <DashboardLayout>
      <Sidebar>
        <SidebarTitle>NEARHELP ADMIN</SidebarTitle>
        <SidebarItem href="#overview">Overview</SidebarItem>
        <SidebarItem href="#live-map">Live Map</SidebarItem>
        <SidebarItem href="#flagged-users">Flagged Users</SidebarItem>
        <SidebarItem onClick={() => navigate('/')}>Exit to App</SidebarItem>
      </Sidebar>

      <MainContent>
        <section id="overview">
          <SectionTitle>Analytics</SectionTitle>
          <StatsGrid>
            <TicketCard style={{ padding: '16px' }}>
              <TicketNumber style={{ fontSize: '32px' }}>{analytics.activeCount}</TicketNumber>
              <TicketLabel>Active SOS</TicketLabel>
            </TicketCard>
            <TicketCard style={{ padding: '16px' }}>
              <TicketNumber style={{ fontSize: '32px' }}>{analytics.avgResponseTimeSec}s</TicketNumber>
              <TicketLabel>Avg Response Time</TicketLabel>
            </TicketCard>
            <TicketCard style={{ padding: '16px' }}>
              <TicketNumber style={{ fontSize: '32px', color: '#E2483D' }}>{analytics.flaggedUserCount}</TicketNumber>
              <TicketLabel>Flagged Users</TicketLabel>
            </TicketCard>
          </StatsGrid>
        </section>

        <section id="live-map">
          <SectionTitle>Live Active Incidents</SectionTitle>
          <div style={{ height: '400px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E8EAED' }}>
            <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {activeIncidents.map(inc => (
                <PulsingPinMarker 
                  key={inc._id} 
                  incident={{
                    ...inc, 
                    broadcasterName: inc.broadcaster?.name || 'Anonymous reporter'
                  }} 
                />
              ))}
            </MapContainer>
          </div>
        </section>

        <section id="flagged-users">
          <SectionTitle>Flagged Users</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>False Alerts</Th>
                <Th>Avg Rating</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {flaggedUsers.map(u => (
                <tr key={u._id}>
                  <Td><strong>{u.name}</strong></Td>
                  <Td>{u.email}</Td>
                  <Td style={{ color: u.trust?.falseAlertCount > 0 ? '#E2483D' : 'inherit' }}>
                    {u.trust?.falseAlertCount || 0}
                  </Td>
                  <Td>{u.trust?.avgRating ? u.trust.avgRating.toFixed(1) : '0.0'}★</Td>
                  <Td>
                    {u.trust?.isSuspended 
                      ? <span style={{ color: '#E2483D', fontWeight: 600 }}>Suspended</span>
                      : <span style={{ color: '#1F9E6D' }}>Active</span>}
                  </Td>
                  <Td>
                    <Button 
                      size="sm"
                      intent={u.trust?.isSuspended ? "primary" : "secondary"}
                      style={{ 
                        backgroundColor: u.trust?.isSuspended ? '#1F9E6D' : '#FBE9E7',
                        color: u.trust?.isSuspended ? 'white' : '#D93025',
                        border: 'none'
                      }}
                      onClick={() => handleToggleSuspend(u._id, u.trust?.isSuspended)}
                    >
                      {u.trust?.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </Button>
                  </Td>
                </tr>
              ))}
              {flaggedUsers.length === 0 && (
                <tr>
                  <Td colSpan={6} style={{ textAlign: 'center', color: '#5B6B7C' }}>No flagged users found.</Td>
                </tr>
              )}
            </tbody>
          </Table>
        </section>
      </MainContent>
    </DashboardLayout>
  );
}
