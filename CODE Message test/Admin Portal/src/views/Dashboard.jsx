import React from 'react';
import { Calendar, Users, MessageSquare, CheckCircle } from 'lucide-react';
import Card from '../components/Card';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'white' }}>Admin Dashboard</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Platform overview and daily operations.</p>
      </div>

      {/* Grid 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Card 1: Recent & Upcoming Events */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Calendar size={20} color="#00F0FF" />
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Recent & Upcoming Events</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'white' }}>Science Fair 2026</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>📅 28 Jun • 🕒 11:00 AM</p>
              </div>
              <button style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>View</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'white' }}>Mid-Term Exams Begin</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>📅 15 Jun • 🕒 08:00 AM</p>
              </div>
              <button style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>View</button>
            </div>
          </div>
        </Card>

        {/* Card 2: Upcoming Meetings */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Users size={20} color="#a855f7" />
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Upcoming Meetings</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ margin: '0 0 4px 0', color: 'white' }}>Parent-Teacher Meeting</h4>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>🕒 09:00 AM • 📍 Virtual Room</p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ margin: '0 0 4px 0', color: 'white' }}>Dept Head Sync</h4>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>🕒 02:00 PM • 📍 Room 101</p>
            </div>
          </div>
        </Card>

        {/* Card 3: Recent Communications */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MessageSquare size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Recent Communications</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: 'white' }}>Michael Chen</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>11:02 AM</span>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Can we move the Grade 10 exam schedule?</p>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: 'white' }}>Sarah Jenkins</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>09:15 AM</span>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Got the new schedule, thanks!</p>
            </div>
          </div>
        </Card>

        {/* Card 4: Attendance Overview Today */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <CheckCircle size={20} color="#10b981" />
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Attendance Overview Today</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: 'white', fontWeight: '700' }}>Faculty</span>
                <span style={{ color: '#10b981', fontWeight: '700' }}>135 Present <span style={{ color: '#ef4444' }}>| 7 Absent</span></span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: '95%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: 'white', fontWeight: '700' }}>Students</span>
                <span style={{ color: '#00F0FF', fontWeight: '700' }}>4500 Present <span style={{ color: '#ef4444' }}>| 321 Absent</span></span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: '93%', height: '100%', background: '#00F0FF', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
