import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BarChart2, TrendingUp, Users, CheckCircle, Award, Calendar, ArrowUpRight } from 'lucide-react';
import Card from '../components/Card';

const ATTENDANCE_TREND = [
  { month: 'Jan', students: 92, faculty: 98 },
  { month: 'Feb', students: 94, faculty: 97 },
  { month: 'Mar', students: 91, faculty: 96 },
  { month: 'Apr', students: 95, faculty: 99 },
  { month: 'May', students: 96, faculty: 98 },
  { month: 'Jun', students: 94, faculty: 97 }
];

const GRADE_PERFORMANCE = [
  { grade: 'Class 6th', avgScore: 84, completion: 78 },
  { grade: 'Class 7th', avgScore: 79, completion: 64 },
  { grade: 'Class 8th', avgScore: 88, completion: 82 },
  { grade: 'Class 9th', avgScore: 76, completion: 55 },
  { grade: 'Class 10th', avgScore: 91, completion: 91 }
];

const SUBJECT_MASTERY = [
  { subject: 'Science (Optics)', score: 88, benchmark: 80 },
  { subject: 'Mathematics', score: 82, benchmark: 75 },
  { subject: 'History', score: 79, benchmark: 70 },
  { subject: 'Geography', score: 85, benchmark: 75 },
  { subject: 'Visual Arts 3D', score: 92, benchmark: 80 }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('Term 1');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>Institutional Performance Analytics</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Real-time telemetry across attendance rates, 3D lab completion, and term assessment scores.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['This Month', 'Term 1', 'Annual 2026'].map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: timeRange === r ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.08)',
                background: timeRange === r ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                color: timeRange === r ? '#00F0FF' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>DAILY ATTENDANCE</span>
            <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>+2.4% <ArrowUpRight size={14} /></span>
          </div>
          <h4 style={{ color: '#10B981', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            94.2%
          </h4>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>4500 Present • 321 Absent</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>AVERAGE ASSESSMENT SCORE</span>
            <span style={{ color: '#00F0FF', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>Grade A <ArrowUpRight size={14} /></span>
          </div>
          <h4 style={{ color: '#00F0FF', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            84.6%
          </h4>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Across 12 Institutional Quizzes</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>3D SIMULATOR ENGAGEMENT</span>
            <span style={{ color: '#a855f7', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>High <ArrowUpRight size={14} /></span>
          </div>
          <h4 style={{ color: '#A855F7', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            91.8%
          </h4>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Active Lab Hours: 142.5 hrs</span>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>TEACHER-STUDENT RATIO</span>
            <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '700' }}>Optimal</span>
          </div>
          <h4 style={{ color: '#3B82F6', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            1 : 28
          </h4>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>135 Faculty across 12 Grades</span>
        </Card>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* Chart 1: Attendance Trajectory */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Attendance Trajectory (% Over Time)</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>Students vs Faculty monthly presence</p>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF', fontSize: '0.75rem', fontWeight: '700' }}>Live</span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_TREND}>
                <defs>
                  <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="facultyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[80, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0a0f1d', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="students" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#studentGrad)" name="Students (%)" />
                <Area type="monotone" dataKey="faculty" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#facultyGrad)" name="Faculty (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Grade Pacing & Average Scores */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Grade Benchmark &amp; Syllabus Completion</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>Average score vs curriculum completion %</p>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', fontSize: '0.75rem', fontWeight: '700' }}>Term 1</span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GRADE_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="grade" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0a0f1d', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="avgScore" fill="#00F0FF" radius={[6, 6, 0, 0]} name="Avg Score (%)" />
                <Bar dataKey="completion" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Syllabus %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Subject Mastery Progress Bars */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Subject Mastery Index (CBSE Standard)</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>Class 6th to 10th aggregate student mastery scores</p>
          </div>
          <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: '700' }}>All 5 Subjects Above Benchmark</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {SUBJECT_MASTERY.map((subj, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#fff', fontWeight: '600' }}>{subj.subject}</span>
                <span style={{ color: '#00F0FF', fontWeight: '700', fontFamily: 'monospace' }}>
                  {subj.score}% <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'normal' }}>(Benchmark: {subj.benchmark}%)</span>
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${subj.score}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #00F0FF)', borderRadius: '4px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
