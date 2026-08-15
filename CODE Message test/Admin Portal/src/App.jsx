import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Events from './views/Events';
import TimeTable from './views/TimeTable';
import Teachers from './views/Teachers';
import Classes from './views/Classes';
import Communications from './views/Communications';
import Analytics from './views/Analytics';
import Settings from './views/Settings';
import Notifications from './views/Notifications';
import { ThemeProvider } from './ThemeContext';
import { supabase } from './supabase';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Portal caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
            background: 'rgba(13, 20, 36, 0.95)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '520px',
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.2)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
            <h2 style={{ color: '#00F0FF', fontSize: '1.6rem', fontWeight: '800', marginBottom: '12px' }}>Admin Deck Ready</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
              The portal encountered a temporary rendering hitch. Click below to reload cleanly.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
              }}
            >
              Reload Admin Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [loadingSession, setLoadingSession] = React.useState(true);
  const [user, setUser] = React.useState(() => {
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch (e) { return null; }
    }
    return null;
  });

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demoUser = urlParams.get('user');
    if (demoUser) {
      try {
        const u = JSON.parse(decodeURIComponent(demoUser));
        localStorage.setItem('edtech_user', JSON.stringify(u));
        setUser(u);
        setLoadingSession(false);
        return;
      } catch (e) { console.error(e); }
    }

    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const userEmail = session.user.email?.toLowerCase();
          
          // Check profiles table for user role
          let dbRole = null;
          let dbName = null;
          let dbAvatar = null;

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', userEmail)
              .maybeSingle();

            if (profile) {
              dbRole = profile.role;
              dbName = profile.name;
              dbAvatar = profile.avatar_url;
            }
          } catch (e) {}

          if (!dbRole) {
            try {
              const { data: dbUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', userEmail)
                .maybeSingle();

              if (dbUser) {
                dbRole = dbUser.role;
                dbName = dbName || dbUser.full_name;
              }
            } catch (e) {}
          }

          const fallbackAdminEmails = [
            'immersionlabsindia@gmail.com',
            'aimodelnewplay@gmail.com',
            'urvashinath0409@gmail.com'
          ];

          const isKnownAdmin = fallbackAdminEmails.includes(userEmail);
          const resolvedRole = dbRole || (isKnownAdmin ? 'admin' : 'student');
          const resolvedName = dbName || session.user.user_metadata?.full_name || userEmail.split('@')[0];

          const activeUser = {
            uid: session.user.id,
            email: userEmail,
            name: resolvedName,
            role: resolvedRole,
            avatar_url: dbAvatar || session.user.user_metadata?.avatar_url || null
          };

          localStorage.setItem('edtech_user', JSON.stringify(activeUser));
          setUser(activeUser);
        } else {
          const userStr = localStorage.getItem('edtech_user');
          if (userStr) {
            try { setUser(JSON.parse(userStr)); } catch (e) { setUser(null); }
          }
        }
      } catch (err) {
        console.error('Session verify error:', err);
      } finally {
        setLoadingSession(false);
      }
    };

    verifySession();
  }, []);

  const loginUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/login.html'
    : 'https://gauravroy888.github.io/Working-Platform/login.html';

  const role = user?.role?.toLowerCase();
  const isAuthorized = user && (
    role === 'admin' || 
    role === 'super_admin' || 
    role === 'superadmin' ||
    user?.email === 'immersionlabsindia@gmail.com' ||
    user?.email === 'aimodelnewplay@gmail.com' ||
    user?.email === 'urvashinath0409@gmail.com'
  );

  if (loadingSession && !user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#060a14',
        color: '#00F0FF',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>⚡</div>
          <p style={{ fontWeight: '700', letterSpacing: '1px' }}>INITIALIZING OPERATIONAL DECK...</p>
        </div>
      </div>
    );
  }

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
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️ 🚫</div>
          <h1 style={{ color: '#EF4444', fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>Access Denied</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
            You do not have Administrator permissions. Your current role is <strong style={{ color: '#00F0FF' }}>{user?.role || 'Guest / Unauthenticated'}</strong>.
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
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter basename="/admin">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/timetable" element={<TimeTable />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

