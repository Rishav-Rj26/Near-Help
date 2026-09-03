import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthUI } from '../components/ui/auth-ui';

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/map');
  }, [user, navigate]);

  return (
    <AuthUI
      signInContent={{
        image: {
          src: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=900&q=80",
          alt: "Emergency responders helping the community",
        },
        quote: {
          text: "Every second counts. Your community is counting on you.",
          author: "NearHelp",
        },
      }}
      signUpContent={{
        image: {
          src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&q=80",
          alt: "People working together in community",
        },
        quote: {
          text: "Be the first to respond. Be someone's hero today.",
          author: "NearHelp",
        },
      }}
    />
  );
}
