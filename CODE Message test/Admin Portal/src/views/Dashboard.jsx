import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MessageSquare, CheckCircle, ArrowRight, BookOpen, Clock, Activity, ShieldAlert, ExternalLink } from 'lucide-react';
import Card from '../components/Card';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Quick KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>TOTAL STUDENTS</span>
            <Users size={18} color="#00F0FF" />
          </div>
          <h4 style={{ color: '#00F0FF', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            4,821
          </h4>
          <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '600' }}>94.2% Attendance Today</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE FACULTY</span>
            <Users size={18} color="#3B82F6" />
          </div>
          <h4 style={{ color: '#3B82F6', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            135
          </h4>
          <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '600' }}>100% Classes Assigned</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE CLASSES</span>
            <BookOpen size={18} color="#A855F7" />
          </div>
          <h4 style={{ color: '#A855F7', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            24 Sections
          </h4>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Grades 1st to 12th</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>3D SIMULATIONS LIVE</span>
            <Activity size={18} color="#10B981" />
          </div>
          <h4 style={{ color: '#10B981', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            100% Online
          </h4>
          <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '600' }}>Cloudflare R2 Edge Synced</span>
        </Card>
      </div>

      {/* Grid 2x2 Main Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* Card 1: Recent & Upcoming Events */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={20} color="#00F0FF" />
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Recent &amp; Upcoming Events</h3>
            </div>
            <Link to="/events" style={{ color: '#00F0FF', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>View All</span> <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1rem' }}>Science Fair &amp; 3D Optics Expo 2026</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>📅 28 Jun • 🕒 11:00 AM • 📍 Virtual Lab 3</p>
              </div>
              <Link to="/events" style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)', color: '#00F0FF', padding: '6px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>
                View
              </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1rem' }}>Mid-Term Exams Begin</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>📅 15 Jun • 🕒 08:00 AM • 📍 Exam Halls</p>
              </div>
              <Link to="/events" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '6px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>
                View
              </Link>
            </div>
          </div>
        </Card>

        {/* Card 2: Upcoming Meetings */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} color="#a855f7" />
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Upcoming Faculty Meetings</h3>
            </div>
            <Link to="/teachers" style={{ color: '#a855f7', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Faculty</span> <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1rem' }}>Parent-Teacher Strategic Meeting</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>🕒 09:00 AM • 📍 Virtual Conference Room 101</p>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.75rem', fontWeight: '700' }}>Virtual</span>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1rem' }}>Science &amp; Physics Dept Sync</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>🕒 02:00 PM • 📍 Room 101 with Gaurav</p>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF', fontSize: '0.75rem', fontWeight: '700' }}>In-Person</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Recent Communications */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={20} color="#3b82f6" />
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Recent Communications</h3>
            </div>
            <Link to="/communications" style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Open Chat</span> <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/communications" style={{ textDecoration: 'none', display: 'block', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: 'white', fontSize: '0.9rem' }}>Michael Chen (Physics Faculty)</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>11:02 AM</span>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Can we move the Grade 10 exam schedule?</p>
            </Link>

            <Link to="/communications" style={{ textDecoration: 'none', display: 'block', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: 'white', fontSize: '0.9rem' }}>Sarah Jenkins (Math Faculty)</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>09:15 AM</span>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Got the new schedule and 3D simulation links, thanks!</p>
            </Link>
          </div>
        </Card>

        {/* Card 4: Attendance Overview Today */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} color="#10b981" />
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Attendance Overview Today</h3>
            </div>
            <Link to="/analytics" style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Analytics</span> <ArrowRight size={14} />
            </Link>
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

