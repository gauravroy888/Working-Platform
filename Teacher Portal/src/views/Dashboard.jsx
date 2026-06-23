import React from 'react';
import Card from '../components/Card';
import { Users, Calendar, CheckSquare, BarChart2, TrendingUp, AlertCircle, FileText } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '50px' }}>
      <div className="view-header">
        <h1>Teacher Dashboard</h1>
        <p>Welcome back, Prof. Anderson. Here's your daily overview.</p>
      </div>
      
      {/* Top Stat Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <Card>
          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="stat-icon" style={{ padding: '15px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)' }}>
              <Users size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px' }}>124</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Total Students</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="stat-icon" style={{ padding: '15px', borderRadius: '50%', background: 'rgba(138, 43, 226, 0.1)', color: 'var(--accent-purple)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px' }}>4</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Classes Today</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="stat-icon" style={{ padding: '15px', borderRadius: '50%', background: 'rgba(255, 215, 0, 0.1)', color: 'var(--accent-gold)' }}>
              <FileText size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px' }}>2</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Active Tests</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="stat-icon" style={{ padding: '15px', borderRadius: '50%', background: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px' }}>84%</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Overall Average</p>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <Card title="Upcoming Classes">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '15px 0', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Advanced Mathematics</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Class 10-A • Room 302</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>10:00 AM</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>In 45 mins</p>
              </div>
            </li>
            <li style={{ padding: '15px 0', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Physics Basics</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Class 9-B • Lab 2</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>1:00 PM</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>In 3 hrs</p>
              </div>
            </li>
          </ul>
        </Card>
        
        <Card title="Analytics Snapshot">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
              <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Top Class</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>11-C</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div style={{ width: '92%', height: '100%', background: 'var(--accent-cyan)', borderRadius: '3px' }}></div>
                </div>
              </div>

              <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Needs Attention</span>
                  <span style={{ color: '#ff3b30', fontWeight: 'bold' }}>Physics (9-B)</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div style={{ width: '68%', height: '100%', background: '#ff3b30', borderRadius: '3px' }}></div>
                </div>
              </div>
           </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <Card title="Active Tests">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '12px 0', borderBottom: '1px solid var(--panel-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Physics Midterm</span>
                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(255,215,0,0.1)', color: 'var(--accent-gold)' }}>MCQ</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>15/28 Submitted</p>
            </li>
            <li style={{ padding: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Math Pop Quiz</span>
                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '10px', background: 'rgba(0,229,255,0.1)', color: 'var(--accent-cyan)' }}>Q/A</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Class 10-A • Starts at 2 PM</p>
            </li>
          </ul>
        </Card>

        <Card title="Recent Activity">
           <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '12px 0', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gold)' }}></div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Created new test: <strong>Physics Midterm</strong></p>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>2 hours ago</p>
              </div>
            </li>
            <li style={{ padding: '12px 0', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Reviewed <strong>Class 11-C</strong> analytics report</p>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>4 hours ago</p>
              </div>
            </li>
            <li style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)' }}></div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Graded <strong>Math Assignment 3</strong></p>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Yesterday</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
