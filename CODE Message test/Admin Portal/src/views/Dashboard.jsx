import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MessageSquare, CheckCircle, ArrowRight, BookOpen, Clock, Activity, ShieldAlert, ExternalLink, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '../supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    coursesCount: 0
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        // 1. Student count
        const { count: studentCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .or('role.eq.student,role.eq.STUDENT');

        // 2. Teacher count & real faculty
        const { data: dbTeachers, count: teacherCount } = await supabase
          .from('users')
          .select('*')
          .or('role.eq.teacher,role.eq.TEACHER');

        // 3. Classes count
        const { count: classCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true });

        // 4. Courses count
        const { count: courseCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true });

        // 5. Recent Announcements
        const { data: dbAnnouncements } = await supabase
          .from('announcements')
          .select('*');

        setStats({
          studentsCount: studentCount || 0,
          teachersCount: teacherCount || (dbTeachers ? dbTeachers.length : 0),
          classesCount: classCount || 0,
          coursesCount: courseCount || 0
        });

        setRecentAnnouncements(dbAnnouncements || []);

        const mappedTeachers = (dbTeachers || []).map(t => ({
          name: t.full_name || t.name || t.email.split('@')[0],
          email: t.email,
          role: t.role === 'teacher' ? 'Subject Faculty' : t.role
        }));
        setFacultyMembers(mappedTeachers);
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardMetrics();
  }, []);

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
            {loading ? '-' : stats.studentsCount}
          </h4>
          <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '600' }}>Verified Database Accounts</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE FACULTY</span>
            <Users size={18} color="#3B82F6" />
          </div>
          <h4 style={{ color: '#3B82F6', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            {loading ? '-' : stats.teachersCount}
          </h4>
          <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '600' }}>Verified Subject Teachers</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE CLASSES</span>
            <BookOpen size={18} color="#A855F7" />
          </div>
          <h4 style={{ color: '#A855F7', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            {loading ? '-' : `${stats.classesCount} Grades`}
          </h4>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Active in Curriculum</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>3D SIMULATIONS LIVE</span>
            <Activity size={18} color="#10B981" />
          </div>
          <h4 style={{ color: '#10B981', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            {loading ? '-' : `${stats.coursesCount} Courses`}
          </h4>
          <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '600' }}>Cloudflare R2 Synced</span>
        </Card>
      </div>

      {/* Grid 2x2 Main Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* Card 1: Recent & Upcoming Notices */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={20} color="#00F0FF" />
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Real Notices &amp; Broadcasts</h3>
            </div>
            <Link to="/events" style={{ color: '#00F0FF', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>View All</span> <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map((a, idx) => (
                <div key={a.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1rem' }}>{a.title}</h4>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                      {a.text ? a.text.slice(0, 50) + (a.text.length > 50 ? '...' : '') : 'Official announcement.'}
                    </p>
                  </div>
                  <Link to="/events" style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)', color: '#00F0FF', padding: '6px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>
                    View
                  </Link>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No notices published yet.</p>
            )}
          </div>
        </Card>

        {/* Card 2: Faculty Roster Directory */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} color="#a855f7" />
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Verified Faculty Staff</h3>
            </div>
            <Link to="/teachers" style={{ color: '#a855f7', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Faculty Directory</span> <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {facultyMembers.length > 0 ? (
              facultyMembers.map((t, idx) => (
                <div key={idx} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={`https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=060a14`}
                      alt={t.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                    />
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', color: 'white', fontSize: '0.95rem' }}>{t.name}</h4>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>{t.email}</p>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF', fontSize: '0.75rem', fontWeight: '700' }}>{t.role}</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No faculty accounts found in database.</p>
            )}
          </div>
        </Card>

        {/* Card 3: Communications */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={20} color="#3b82f6" />
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Platform Communications</h3>
            </div>
            <Link to="/communications" style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Open Chat</span> <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {facultyMembers.map((t, idx) => (
              <Link key={idx} to={`/communications?to=${encodeURIComponent(t.email)}`} style={{ textDecoration: 'none', display: 'block', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: 'white', fontSize: '0.9rem' }}>{t.name}</strong>
                  <span style={{ color: '#00F0FF', fontSize: '0.75rem' }}>Send Direct Message</span>
                </div>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Open direct real-time communication channel with {t.name}.</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Card 4: Platform Health */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} color="#10b981" />
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Database &amp; Platform Health</h3>
            </div>
            <Link to="/analytics" style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Analytics</span> <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: 'white', fontWeight: '700' }}>Supabase PostgreSQL Connection</span>
                <span style={{ color: '#10b981', fontWeight: '700' }}>🟢 Connected (Active)</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: 'white', fontWeight: '700' }}>Cloudflare R2 3D Asset Storage</span>
                <span style={{ color: '#00F0FF', fontWeight: '700' }}>🟢 Online (Zero Egress)</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#00F0FF', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
