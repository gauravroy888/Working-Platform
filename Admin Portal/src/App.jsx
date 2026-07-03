import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Events from './views/Events';
import TimeTable from './views/TimeTable';
import Teachers from './views/Teachers';
import Classes from './views/Classes';
import Analytics from './views/Analytics';
import Settings from './views/Settings';
import Communications from './views/Communications';
import Notifications from './views/Notifications';
import './App.css';
import { supabase } from './supabase';

function App() {
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
        const u = JSON.parse(decodeURIComponent(demoUser));
        localStorage.setItem('edtech_user', JSON.stringify(u));
        setUser(u);
        return;
      }

      const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        localStorage.removeItem('edtech_user');
        setUser(null);
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

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0f1d', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ color: '#FF6B6B', marginBottom: '10px' }}>Access Denied</h1>
        <p style={{ color: '#8b9bb4', marginBottom: '30px' }}>You do not have permission to access the Admin Portal.</p>
        <a href={window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '/login.html' : 'https://gauravroy888.github.io/Working-Platform/login.html'} style={{ padding: '12px 24px', background: 'var(--accent-cyan, #00f0ff)', color: '#000', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Return to Login</a>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="timetable" element={<TimeTable />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="communications" element={<Communications />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
}

export default App;

console.log('Cache buster v2');
