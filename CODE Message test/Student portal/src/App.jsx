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
import './App.css';

export default function App() {
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
