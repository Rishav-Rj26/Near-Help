import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TicketCard, TicketRow, TicketLabel } from '../components/ui/TicketCard.stitch';
import { Button } from '../components/ui/Button.stitch';
import { styled } from '../styles/theme';

const AuthContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: '$baseNavy',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$md',
});

const Input = styled('input', {
  width: '100%',
  padding: '$sm',
  marginBottom: '$md',
  border: '1px solid #5B6B7C',
  borderRadius: '$sm',
  fontFamily: '$mono',
  fontSize: '$subtitle',
  backgroundColor: 'transparent',
  color: '$ink',
  
  '&:focus': {
    outline: 'none',
    borderColor: '$amber',
  },
});

const ErrorMessage = styled('div', {
  color: '$crisisMedical',
  fontSize: '$caption',
  marginBottom: '$sm',
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, signup, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate('/');
    } catch (err) {
      // Error is handled in context and surfaced via `error` prop
    }
  };

  return (
    <AuthContainer>
      <TicketCard style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ paddingBottom: '20px', borderBottom: '1px dashed #5B6B7C', marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', margin: 0, fontSize: '24px' }}>
            {isLogin ? 'Dispatcher Login' : 'Responder Signup'}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <TicketLabel>Full Name</TicketLabel>
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </>
          )}

          <TicketLabel>Email Address</TicketLabel>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TicketLabel>Password</TicketLabel>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" size="block" intent="resolve" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Processing...' : isLogin ? 'Access System' : 'Register'}
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Button intent="secondary" onClick={() => setIsLogin(!isLogin)} style={{ border: 'none' }}>
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
          </Button>
        </div>
      </TicketCard>
    </AuthContainer>
  );
}
