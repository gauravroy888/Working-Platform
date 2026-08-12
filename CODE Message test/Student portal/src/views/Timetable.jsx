import React from 'react';
import { Calendar, Clock, MapPin, Video, BookOpen } from 'lucide-react';
import Card from '../components/Card';
import './Timetable.css';

export default function Timetable() {
  const schedule = [
    { time: '09:00 AM - 10:00 AM', subject: 'Class 6th Physics & Optics', room: 'Lab 3 (3D VR Room)', status: 'Live Now', icon: '💡' },
    { time: '10:15 AM - 11:15 AM', subject: 'Class 6th Mathematics', room: 'Room 204', status: 'Upcoming', icon: '📐' },
    { time: '11:30 AM - 12:30 PM', subject: 'Class 6th Chemistry & Elements', room: 'Virtual Sim Lab', status: 'Upcoming', icon: '🧪' },
    { time: '01:30 PM - 02:30 PM', subject: 'Class 6th Astronomy & Gravity', room: 'Dome Theater', status: 'Scheduled', icon: '🪐' }
  ];

  return (
    <div className="view-container">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: '800' }}>Today's Class Schedule</h3>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Wednesday, Class 6th Science & Mathematics</p>
          </div>
          <span style={{
            background: 'rgba(0, 240, 255, 0.15)',
            color: '#00F0FF',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '700'
          }}>
            4 Classes Scheduled
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {schedule.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderRadius: '16px',
              background: item.status === 'Live Now' ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(59, 130, 246, 0.15))' : 'rgba(255, 255, 255, 0.03)',
              border: item.status === 'Live Now' ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: item.status === 'Live Now' ? '0 0 20px rgba(0, 240, 255, 0.15)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '2rem' }}>{item.icon}</div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>{item.subject}</h4>
                  <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {item.time}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {item.room}</span>
                  </div>
                </div>
              </div>

              <div>
                {item.status === 'Live Now' ? (
                  <button 
                    onClick={() => {
                      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                      const basePath = isLocal ? '' : '/Working-Platform';
                      window.open(window.location.origin + basePath + '/Content%20Platform/ED-tech-main/index.html', '_blank');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
                      color: '#000',
                      fontWeight: '700',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
                    }}
                  >
                    <Video size={16} /> Join 3D Class
                  </button>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>{item.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
