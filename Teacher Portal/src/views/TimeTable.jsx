import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { supabase } from '../supabase';
import { BookOpen, Video } from 'lucide-react';

export default function TimeTable() {
  const [schedule, setSchedule] = useState([]);
  
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, min] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${min} ${ampm}`;
  };

  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const userStr = localStorage.getItem('edtech_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('timetable')
          .eq('email', user.email)
          .single();
          
        if (!error && data?.timetable && Array.isArray(data.timetable)) {
          const uniqueTimes = [...new Set(data.timetable.map(s => s.startTime))].sort();
          const newSchedule = uniqueTimes.map(time => {
            const row = { time: formatTime(time) };
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
              const slot = data.timetable.find(s => s.startTime === time && s.day === day);
              row[day.toLowerCase()] = slot ? slot.activity : '-';
            });
            return row;
          });
          setSchedule(newSchedule);
        }
      } catch (err) {
        console.error('Error fetching timetable:', err);
      }
    };
    
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
    
    fetchTimetable();
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
                <th style={{ padding: '15px' }}>Saturday</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No schedule assigned yet.
                  </td>
                </tr>
              ) : (
                schedule.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                    <td style={{ padding: '15px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{row.time}</td>
                    <td style={{ padding: '15px' }}>{row.monday}</td>
                    <td style={{ padding: '15px' }}>{row.tuesday}</td>
                    <td style={{ padding: '15px' }}>{row.wednesday}</td>
                    <td style={{ padding: '15px' }}>{row.thursday}</td>
                    <td style={{ padding: '15px' }}>{row.friday}</td>
                    <td style={{ padding: '15px' }}>{row.saturday}</td>
                  </tr>
                ))
              )}
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
