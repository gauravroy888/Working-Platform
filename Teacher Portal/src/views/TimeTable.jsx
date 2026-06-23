import React from 'react';
import Card from '../components/Card';

export default function TimeTable() {
  const schedule = [
    { time: '09:00 AM', monday: 'Math 10-A', tuesday: 'Physics 9-B', wednesday: 'Math 10-A', thursday: 'Physics 9-B', friday: 'Admin Duty' },
    { time: '10:00 AM', monday: 'Math 10-A', tuesday: 'Physics 9-B', wednesday: 'Math 10-A', thursday: 'Physics 9-B', friday: 'Admin Duty' },
    { time: '11:00 AM', monday: 'Break', tuesday: 'Break', wednesday: 'Break', thursday: 'Break', friday: 'Break' },
    { time: '12:00 PM', monday: 'Physics 11-C', tuesday: 'Math 12-A', wednesday: 'Physics 11-C', thursday: 'Math 12-A', friday: 'Lab 11-C' },
    { time: '01:00 PM', monday: 'Physics 11-C', tuesday: 'Math 12-A', wednesday: 'Physics 11-C', thursday: 'Math 12-A', friday: 'Lab 11-C' },
  ];

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
    </div>
  );
}
