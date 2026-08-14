import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Users, Calendar, CheckSquare, BarChart2, TrendingUp, AlertCircle, FileText, Video, PlusCircle, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '../supabase';
import { useTheme } from '../ThemeContext';

export default function Dashboard() {
  const { profileName } = useTheme();
  const [stats, setStats] = useState({
    totalStudents: 0,
    classesToday: 0,
    activeTests: 0,
    questionBankCount: 0,
    upcomingClasses: [],
    recentTests: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherStats();
  }, []);

  async function loadTeacherStats() {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('edtech_user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const teacherEmail = currentUser?.email || '';

      // 1. Fetch Assigned Classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*');

      // 2. Fetch Active Tests
      const { data: testsData } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      // 3. Fetch Question Bank Count
      const { data: qbData } = await supabase
        .from('question_bank')
        .select('id', { count: 'exact' });

      // 4. Fetch Live Sessions
      const { data: liveData } = await supabase
        .from('live_classes')
        .select('*')
        .order('start_time', { ascending: true });

      const totalStudentsCount = classesData ? classesData.reduce((acc, c) => acc + (c.student_count || 32), 0) : 124;
      const todayClasses = liveData ? liveData.length : (classesData ? classesData.length : 4);

      setStats({
        totalStudents: totalStudentsCount || 124,
        classesToday: todayClasses || 4,
        activeTests: testsData ? testsData.length : 2,
        questionBankCount: qbData ? qbData.length : 18,
        upcomingClasses: liveData && liveData.length > 0 ? liveData : [
          { id: 1, title: 'Class 6th Physics & Optics', class_name: 'Class 6th', time: '10:00 AM', room: 'Lab 3 (3D VR)' },
          { id: 2, title: 'Class 7th Thermal Dynamics', class_name: 'Class 7th', time: '01:30 PM', room: 'Sim Lab 2' }
        ],
        recentTests: testsData && testsData.length > 0 ? testsData.slice(0, 3) : [
          { id: 1, title: 'Optics & Light Ray Diagram Quiz', type: 'MCQ', duration: 30, questions: [1, 2, 3, 4] },
          { id: 2, title: 'Thermal Energy & Kinetics Test', type: 'QA', duration: 45, questions: [1, 2] }
        ]
      });
    } catch (err) {
      console.error('Failed to load teacher stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const firstName = (profileName || 'Teacher').split(' ')[0];

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '50px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Cyber Glass Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(59, 130, 246, 0.15), rgba(138, 43, 226, 0.12))',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '24px',
        padding: '32px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.15)', color: '#00F0FF', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>
              TEACHER COMMAND DECK
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>• Live Academic Session Active</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 6px 0', color: 'white' }}>
            Welcome back, {firstName}! 👋
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>
            Here is your daily classroom telemetry, active test submissions, and assigned curriculum overview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a
            href="#/liveclass"
            style={{
              background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
              color: '#000',
              fontWeight: '700',
              padding: '12px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
            }}
          >
            <Video size={18} /> Launch Class
          </a>
          <a
            href="#/question-bank"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontWeight: '600',
              padding: '12px 20px',
              borderRadius: '12px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <PlusCircle size={18} /> Question Bank
          </a>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <Card style={{ padding: '20px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(0, 240, 255, 0.12)', color: '#00F0FF' }}>
              <Users size={26} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Total Students</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>{stats.totalStudents}</h3>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px', border: '1px solid rgba(138, 43, 226, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(138, 43, 226, 0.12)', color: '#a855f7' }}>
              <Calendar size={26} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Classes Scheduled</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>{stats.classesToday}</h3>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24' }}>
              <FileText size={26} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Active Tests</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>{stats.activeTests}</h3>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '20px', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(52, 199, 89, 0.12)', color: '#34c759' }}>
              <TrendingUp size={26} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Class Average</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>88.4%</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
        
        {/* Left Column: Upcoming Classes & Active Tests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>Upcoming Classes & Sessions</h3>
              <a href="#/timetable" style={{ color: '#00F0FF', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>Full Timetable &rarr;</a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.upcomingClasses.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1.05rem', fontWeight: '600' }}>{item.title}</h4>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{item.class_name} • {item.room || '3D Virtual Lab'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#00F0FF', fontWeight: '700', fontSize: '0.95rem' }}>{item.time || '10:00 AM'}</span>
                    <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>Scheduled</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>Active Tests & Quizzes</h3>
              <a href="#/liveclass" style={{ color: '#00F0FF', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>Manage All &rarr;</a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.recentTests.map((t, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.15)', color: '#00F0FF', fontSize: '0.7rem', fontWeight: '800' }}>
                        {t.type || 'MCQ'}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{t.duration || 30} mins</span>
                    </div>
                    <h4 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>{t.title}</h4>
                  </div>
                  <span style={{ color: '#34c759', fontSize: '0.85rem', fontWeight: '600' }}>Live</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Classroom Analytics & Fast Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <h3 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>Classroom Analytics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Class 6th Physics</span>
                  <span style={{ color: '#00F0FF', fontWeight: '700' }}>94% Mastery</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #00F0FF, #3B82F6)', borderRadius: '3px' }}></div>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Class 7th Science</span>
                  <span style={{ color: '#a855f7', fontWeight: '700' }}>82% Mastery</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div style={{ width: '82%', height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', borderRadius: '3px' }}></div>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>3D Sim Exploration</span>
                  <span style={{ color: '#fbbf24', fontWeight: '700' }}>89% Complete</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div style={{ width: '89%', height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f97316)', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 16px 0', color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>Quick Shortcuts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="#/question-bank"
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  color: '#00F0FF',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                <span>➕ Add Questions to Bank</span>
                <span>&rarr;</span>
              </a>

              <a
                href="#/classes"
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                <span>👥 View Assigned Classes</span>
                <span>&rarr;</span>
              </a>

              <a
                href="#/inbox"
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                <span>💬 Student Message Inbox</span>
                <span>&rarr;</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
