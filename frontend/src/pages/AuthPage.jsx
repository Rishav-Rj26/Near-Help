import React from 'react';
import { AuthUI } from '../components/ui/auth-ui';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  return (
    <AuthUI
      signInContent={{
        image: {
          src: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&q=80",
          alt: "Emergency responders helping the community",
        },
        quote: {
          text: "Welcome Back! Your community needs you.",
          author: "NearHelp",
        },
      }}
      signUpContent={{
        image: {
          src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
          alt: "People working together in community",
        },
        quote: {
          text: "Join the movement. Be someone's first responder.",
          author: "NearHelp",
        },
      }}
    />
  );
}
