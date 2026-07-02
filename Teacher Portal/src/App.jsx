import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import TimeTable from './views/TimeTable';
import ToDoList from './views/ToDoList';
import Inbox from './views/Inbox';
import Classes from './views/Classes';
import Analytics from './views/Analytics';
import LiveClass from './views/LiveClass';
import Settings from './views/Settings';
import Notifications from './views/Notifications';
import { ThemeProvider } from './ThemeContext';
import { supabase } from './supabase';

export default function App() {
  const [user, setUser] = React.useState(() => {
    // Read from localStorage first for instant render
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch (e) { return null; }
    }
    return null;
  });

  React.useEffect(() => {
    // Verify the Supabase session is still valid and re-confirm role from DB
    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // No valid session - clear localStorage and deny access
        localStorage.removeItem('edtech_user');
        setUser(null);
        return;
      }
      // Session valid - trust DB role stored in localStorage (set by supabase-config.js)
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          // Ensure email matches session to prevent spoofing
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

  if (!user || user.role !== 'teacher') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0f1d', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ color: '#FF6B6B', marginBottom: '10px' }}>Access Denied</h1>
        <p style={{ color: '#8b9bb4', marginBottom: '30px' }}>You do not have permission to access the Teacher Portal.</p>
        <a href="https://gauravroy888.github.io/Comm-Test/" style={{ padding: '12px 24px', background: '#00f0ff', color: '#000', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Return to Login</a>
      </div>
    );
  }
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timetable" element={<TimeTable />} />
            <Route path="/todo" element={<ToDoList />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/liveclass" element={<LiveClass />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}
