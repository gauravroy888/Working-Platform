import React from 'react';
import { BookOpen, Trophy, Clock, PlayCircle, ArrowRight } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import './Dashboard.css';

export default function Dashboard() {
  const userStr = localStorage.getItem('edtech_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.name || 'Student';

  return (
    <div className="view-container">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(59, 130, 246, 0.15))',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '20px',
        padding: '28px 36px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 8px 0', color: 'white' }}>
            Welcome to Study Island, {userName.split(' ')[0]}! 👋
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '1.05rem' }}>
            You have <strong>3 3D Interactive Chapters</strong> assigned in <strong>Class 6th Science</strong>.
          </p>
        </div>
        <button 
          onClick={() => {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const basePath = isLocal ? '' : '/Working-Platform';
            window.open(window.location.origin + basePath + '/study-island/index.html', '_blank');
          }}
          style={{
            background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
            color: '#000',
            fontWeight: '700',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)'
          }}
        >
          <PlayCircle size={20} /> Launch Study Island <ArrowRight size={16} />
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,240,255,0.1)', color: '#00F0FF' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Assigned Courses</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>3 Courses</h3>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
              <Trophy size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Total XP Earned</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>+450 XP</h3>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>3D Exploration Time</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>4.2 Hours</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Featured Active Course */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: '700' }}>Active Learning Module</h3>
          <span style={{ color: '#00F0FF', fontSize: '0.85rem', fontWeight: '600' }}>In Progress</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(0,240,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,240,255,0.3)', fontSize: '2rem' }}>
            💡
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 6px 0', color: 'white', fontSize: '1.2rem' }}>Class 6th Physics & Optics: Light & Shadows</h4>
            <p style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '0.9rem' }}>Interactive 3D exploration of umbra, penumbra, and ray diagrams.</p>
            <ProgressBar progress={85} />
          </div>
        </div>
      </Card>
    </div>
  );
}
