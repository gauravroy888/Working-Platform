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
    const urlParams = new URLSearchParams(window.location.search);
    const demoUser = urlParams.get('user');
    if (demoUser) {
      try {
        const u = JSON.parse(decodeURIComponent(demoUser));
        localStorage.setItem('edtech_user', JSON.stringify(u));
        setUser(u);
        return;
      } catch (e) { console.error(e); }
    }

    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const userStr = localStorage.getItem('edtech_user');
        if (!userStr) {
          setUser(null);
        }
        return;
      }
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.email === session.user.email) {
            setUser(u);
          } else {
            localStorage.removeItem('edtech_user');
            setUser(null);
          }
        } catch (e) { setUser(null); }
      }
    };
    verifySession();
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
