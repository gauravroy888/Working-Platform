import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Courses from './views/Courses';
import Timetable from './views/Timetable';
import LiveClass from './views/LiveClass';
import Chats from './views/Chats';
import Mentors from './views/Mentors';
import Progress from './views/Progress';
import Notifications from './views/Notifications';
import Settings from './views/Settings';
import { ThemeProvider } from './ThemeContext';
import { supabase } from './supabase';
import './App.css';

export default function App() {
  const [user, setUser] = React.useState(() => {
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch (e) { return null; }
    }
    return null;
  });

  React.useEffect(() => {
    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          const userStr = localStorage.getItem('edtech_user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              if (u && (u.role === 'student' || u.role === 'super_admin' || u.role === 'superadmin')) {
                setUser(u);
                return;
              }
            } catch (e) {}
          }
          localStorage.removeItem('edtech_user');
          setUser(null);
          return;
        }

        const userEmail = session.user.email?.toLowerCase();
        
        // Verify genuine server-side role from Supabase DB
        let verifiedRole = null;
        let verifiedName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];
        let verifiedAvatar = session.user.user_metadata?.avatar_url;

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle();

          if (profile) {
            verifiedRole = profile.role;
            if (profile.name) verifiedName = profile.name;
            if (profile.avatar_url) verifiedAvatar = profile.avatar_url;
          }
        } catch (e) {}

        if (userEmail === 'urvashinath0409@gmail.com') {
          verifiedRole = 'super_admin';
        }

        const verifiedUser = {
          uid: session.user.id,
          email: userEmail,
          name: verifiedName,
          role: verifiedRole || 'student',
          avatar_url: verifiedAvatar
        };

        localStorage.setItem('edtech_user', JSON.stringify(verifiedUser));
        setUser(verifiedUser);
      } catch (err) {
        console.error('Student session verification error:', err);
      }
    };

    verifySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        verifySession();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/login.html'
    : 'https://gauravroy888.github.io/Working-Platform/login.html';

  const isAuthorized = user && (user.role === 'student' || user.role === 'super_admin' || user.role === 'superadmin');

  if (!isAuthorized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#060a14',
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(13, 20, 36, 0.85)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '24px',
          padding: '48px 40px',
          maxWidth: '480px',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎓 🚫</div>
          <h1 style={{ color: '#EF4444', fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>Access Denied</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
            This portal is restricted to Students. Your current role is <strong style={{ color: '#00F0FF' }}>{user?.role || 'Guest / Unauthenticated'}</strong>.
          </p>
          <a href={loginUrl} style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
          }}>
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter basename="/student">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/courses" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/liveclass" element={<LiveClass />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/courses" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
