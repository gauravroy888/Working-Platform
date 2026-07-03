import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { supabase } from '../supabase';
import { BookOpen, Video } from 'lucide-react';

export default function TimeTable() {
  const schedule = [
    { time: '09:00 AM', monday: 'Math 10-A', tuesday: 'Physics 9-B', wednesday: 'Math 10-A', thursday: 'Physics 9-B', friday: 'Admin Duty' },
    { time: '10:00 AM', monday: 'Math 10-A', tuesday: 'Physics 9-B', wednesday: 'Math 10-A', thursday: 'Physics 9-B', friday: 'Admin Duty' },
    { time: '11:00 AM', monday: 'Break', tuesday: 'Break', wednesday: 'Break', thursday: 'Break', friday: 'Break' },
    { time: '12:00 PM', monday: 'Physics 11-C', tuesday: 'Math 12-A', wednesday: 'Physics 11-C', thursday: 'Math 12-A', friday: 'Lab 11-C' },
    { time: '01:00 PM', monday: 'Physics 11-C', tuesday: 'Math 12-A', wednesday: 'Physics 11-C', thursday: 'Math 12-A', friday: 'Lab 11-C' },
  ];

  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const fetchUpdates = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .in('type', ['assignment', 'meeting'])
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) {
        setUpdates(data);
      }
    };
    fetchUpdates();
  }, []);

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <h1>Time Table</h1>
        <p>Your weekly class schedule.</p>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--panel-border)', textAlign: 'left' }}>
                <th style={{ padding: '15px' }}>Time</th>
                <th style={{ padding: '15px' }}>Monday</th>
                <th style={{ padding: '15px' }}>Tuesday</th>
                <th style={{ padding: '15px' }}>Wednesday</th>
                <th style={{ padding: '15px' }}>Thursday</th>
                <th style={{ padding: '15px' }}>Friday</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                  <td style={{ padding: '15px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{row.time}</td>
                  <td style={{ padding: '15px' }}>{row.monday}</td>
                  <td style={{ padding: '15px' }}>{row.tuesday}</td>
                  <td style={{ padding: '15px' }}>{row.wednesday}</td>
                  <td style={{ padding: '15px' }}>{row.thursday}</td>
                  <td style={{ padding: '15px' }}>{row.friday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Online Classes & Tests Updates</h2>
        <Card>
          {updates.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {updates.map(update => (
                <div key={update.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                  <div style={{ backgroundColor: update.type === 'meeting' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(138, 43, 226, 0.1)', color: update.type === 'meeting' ? '#00E5FF' : '#8A2BE2', padding: '10px', borderRadius: '10px', marginRight: '15px' }}>
                    {update.type === 'meeting' ? <Video size={20} /> : <BookOpen size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{update.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{update.message}</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
                      {new Date(update.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>No recent updates found.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
