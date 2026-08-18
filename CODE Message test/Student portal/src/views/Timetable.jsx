import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '../supabase';
import './Timetable.css';

export default function Timetable() {
  const [selectedDay, setSelectedDay] = useState('Wednesday');
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const scheduleByDay = {
    Monday: [
      { time: '09:00 AM - 10:00 AM', subject: 'Class 6th Mathematics: Geometry Theorems', room: 'Room 204', status: 'Scheduled', icon: '📐', teacher: 'Prof. Sharma' },
      { time: '10:15 AM - 11:15 AM', subject: 'Class 6th Physics & Optics', room: 'Lab 3 (3D VR Room)', status: 'Scheduled', icon: '💡', teacher: 'Gaurav' },
      { time: '11:30 AM - 12:30 PM', subject: 'Class 6th English Literature', room: 'Room 102', status: 'Scheduled', icon: '📝', teacher: 'Prof. Verma' },
      { time: '01:30 PM - 02:30 PM', subject: 'Class 6th Visual Arts & 3D Design', room: 'Art Studio A', status: 'Scheduled', icon: '🎨', teacher: 'Prof. Gupta' }
    ],
    Tuesday: [
      { time: '09:00 AM - 10:00 AM', subject: 'Class 6th World Geography & Continents', room: 'Geo Lab 1', status: 'Scheduled', icon: '🌍', teacher: 'Prof. Patel' },
      { time: '10:15 AM - 11:15 AM', subject: 'Class 6th Thermal Dynamics', room: 'Virtual Sim Lab', status: 'Scheduled', icon: '🔥', teacher: 'Gaurav' },
      { time: '11:30 AM - 12:30 PM', subject: 'Class 6th Ancient History', room: 'Room 105', status: 'Scheduled', icon: '🏛️', teacher: 'Prof. Roy' },
      { time: '01:30 PM - 02:30 PM', subject: 'Class 6th Physical Education', room: 'Main Gymnasium', status: 'Scheduled', icon: '🏃', teacher: 'Coach Singh' }
    ],
    Wednesday: [
      { time: '09:00 AM - 10:00 AM', subject: 'Class 6th Physics: Light & Shadows', room: 'Lab 3 (3D VR Room)', status: 'Live Now', icon: '💡', teacher: 'Gaurav', hasSim: true },
      { time: '10:15 AM - 11:15 AM', subject: 'Class 6th Mathematics: Algebraic Equations', room: 'Room 204', status: 'Upcoming', icon: '📐', teacher: 'Prof. Sharma' },
      { time: '11:30 AM - 12:30 PM', subject: 'Class 6th Chemistry: Elements & Molecules', room: 'Virtual Sim Lab', status: 'Upcoming', icon: '🧪', teacher: 'Prof. Kapoor' },
      { time: '01:30 PM - 02:30 PM', subject: 'Class 6th Astronomy & Gravity', room: 'Dome Theater', status: 'Scheduled', icon: '🪐', teacher: 'Gaurav', hasSim: true }
    ],
    Thursday: [
      { time: '09:00 AM - 10:00 AM', subject: 'Class 6th English Grammar & Syntax', room: 'Room 102', status: 'Scheduled', icon: '📝', teacher: 'Prof. Verma' },
      { time: '10:15 AM - 11:15 AM', subject: 'Class 6th Music Theory & Acoustics', room: 'Acoustics Lab', status: 'Scheduled', icon: '🎵', teacher: 'Prof. Iyer' },
      { time: '11:30 AM - 12:30 PM', subject: 'Class 6th Physics: Ray Diagram Laboratory', room: 'Virtual Sim Lab', status: 'Scheduled', icon: '🔬', teacher: 'Gaurav', hasSim: true },
      { time: '01:30 PM - 02:30 PM', subject: 'Class 6th Mathematics: Spatial Reasoning', room: 'Room 204', status: 'Scheduled', icon: '📐', teacher: 'Prof. Sharma' }
    ],
    Friday: [
      { time: '09:00 AM - 10:00 AM', subject: 'Class 6th Weekly Assessment & Quiz', room: 'Computer Lab 1', status: 'Scheduled', icon: '🏆', teacher: 'Gaurav' },
      { time: '10:15 AM - 11:15 AM', subject: 'Class 6th Environmental Science', room: 'Eco Garden Lab', status: 'Scheduled', icon: '🌱', teacher: 'Prof. Sen' },
      { time: '11:30 AM - 12:30 PM', subject: 'Class 6th History & Civilizations', room: 'Room 105', status: 'Scheduled', icon: '🏛️', teacher: 'Prof. Roy' },
      { time: '01:30 PM - 02:30 PM', subject: 'Class 6th 3D Project Showcase', room: 'Main Auditorium', status: 'Scheduled', icon: '✨', teacher: 'Faculty' }
    ]
  };

  useEffect(() => {
    fetchActiveClasses();
  }, []);

  async function fetchActiveClasses() {
    setLoading(true);
    try {
      const { data } = await supabase.from('live_classes').select('*').eq('status', 'active');
      if (data) setLiveSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const currentSchedule = scheduleByDay[selectedDay] || scheduleByDay.Wednesday;

  return (
    <div className="view-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: '800' }}>Academic Class Timetable</h3>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>Class 6th • Delhi Public School Academic Schedule</p>
          </div>

          {/* Weekday Switcher Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '14px', padding: '4px', gap: '4px' }}>
            {daysOfWeek.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: selectedDay === d ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                  background: selectedDay === d ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(59, 130, 246, 0.2))' : 'transparent',
                  color: selectedDay === d ? 'var(--brand-primary, #00F0FF)' : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentSchedule.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderRadius: '16px',
              background: item.status === 'Live Now' ? 'linear-gradient(135deg, var(--brand-glow, rgba(0, 240, 255, 0.15)), var(--brand-secondary, rgba(59, 130, 246, 0.15)))' : 'rgba(255, 255, 255, 0.03)',
              border: item.status === 'Live Now' ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: item.status === 'Live Now' ? '0 0 25px rgba(0, 240, 255, 0.2)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '2rem' }}>{item.icon}</div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>{item.subject}</h4>
                  <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {item.time}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {item.room}</span>
                    <span style={{ color: 'var(--brand-primary, #00F0FF)' }}>• {item.teacher}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {item.hasSim && (
                  <button 
                    onClick={() => {
                      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                      const basePath = isLocal ? '' : '/Working-Platform';
                      window.open(window.location.origin + basePath + '/study-island/index.html', '_blank');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, var(--brand-primary, #00F0FF), var(--brand-secondary, #3B82F6))',
                      color: '#000',
                      fontWeight: '700',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 0 15px var(--brand-glow, rgba(0, 240, 255, 0.3))'
                    }}
                  >
                    <Video size={16} /> Launch 3D Lab
                  </button>
                )}
                {!item.hasSim && (
                  <span style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    color: item.status === 'Upcoming' ? '#fbbf24' : '#94a3b8',
                    fontSize: '0.85rem',
                    fontWeight: '700'
                  }}>
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
