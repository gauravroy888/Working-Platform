import React, { useState } from 'react';
import { Clock, Calendar, BookOpen, User, MapPin, Plus, Edit2, Download, Check } from 'lucide-react';
import Card from '../components/Card';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const CLASSES = ['Class 6th A', 'Class 6th B', 'Class 7th A', 'Class 8th A', 'Class 9th A', 'Class 10th A'];

const TIMETABLE_DATA = {
  'Class 6th A': {
    'Monday': [
      { period: 1, time: '08:30 - 09:15', subject: 'Physics & Optics', teacher: 'Gaurav', room: 'Lab 3D-1', type: 'Lab', color: '#00F0FF' },
      { period: 2, time: '09:20 - 10:05', subject: 'Mathematics', teacher: 'Harsh', room: 'Room 204', type: 'Theory', color: '#3B82F6' },
      { period: 3, time: '10:10 - 10:55', subject: 'English Literature', teacher: 'Prof. Rajesh', room: 'Room 102', type: 'Theory', color: '#A855F7' },
      { period: 4, time: '11:15 - 12:00', subject: 'Ancient History', teacher: 'Dr. Ananya', room: 'Room 305', type: 'Theory', color: '#F59E0B' },
      { period: 5, time: '12:05 - 12:50', subject: 'Visual Arts & 3D', teacher: 'Prof. Rohan', room: 'Studio B', type: 'Practical', color: '#EC4899' },
      { period: 6, time: '01:30 - 02:15', subject: 'Physical Education', teacher: 'Coach Vikram', room: 'Grounds', type: 'Sports', color: '#10B981' }
    ],
    'Tuesday': [
      { period: 1, time: '08:30 - 09:15', subject: 'Mathematics', teacher: 'Harsh', room: 'Room 204', type: 'Theory', color: '#3B82F6' },
      { period: 2, time: '09:20 - 10:05', subject: 'Earth Geography', teacher: 'Prof. Vikram', room: 'Room 306', type: 'Theory', color: '#10B981' },
      { period: 3, time: '10:10 - 10:55', subject: 'Physics & Optics', teacher: 'Gaurav', room: 'Lab 3D-1', type: 'Lab', color: '#00F0FF' },
      { period: 4, time: '11:15 - 12:00', subject: 'Chemistry Lab', teacher: 'Dr. Sunita', room: 'Chem Lab 2', type: 'Practical', color: '#A855F7' },
      { period: 5, time: '12:05 - 12:50', subject: 'English Grammar', teacher: 'Prof. Rajesh', room: 'Room 102', type: 'Theory', color: '#F59E0B' },
      { period: 6, time: '01:30 - 02:15', subject: 'Acoustics & Music', teacher: 'Prof. Meera', room: 'Music Hall', type: 'Practical', color: '#EC4899' }
    ],
    'Wednesday': [
      { period: 1, time: '08:30 - 09:15', subject: 'Ancient History', teacher: 'Dr. Ananya', room: 'Room 305', type: 'Theory', color: '#F59E0B' },
      { period: 2, time: '09:20 - 10:05', subject: 'Physics & Optics', teacher: 'Gaurav', room: 'Lab 3D-1', type: 'Lab', color: '#00F0FF' },
      { period: 3, time: '10:10 - 10:55', subject: 'Mathematics', teacher: 'Harsh', room: 'Room 204', type: 'Theory', color: '#3B82F6' },
      { period: 4, time: '11:15 - 12:00', subject: 'Physical Education', teacher: 'Coach Vikram', room: 'Grounds', type: 'Sports', color: '#10B981' },
      { period: 5, time: '12:05 - 12:50', subject: 'Visual Arts', teacher: 'Prof. Rohan', room: 'Studio B', type: 'Practical', color: '#EC4899' },
      { period: 6, time: '01:30 - 02:15', subject: 'English', teacher: 'Prof. Rajesh', room: 'Room 102', type: 'Theory', color: '#A855F7' }
    ],
    'Thursday': [
      { period: 1, time: '08:30 - 09:15', subject: 'Earth Geography', teacher: 'Prof. Vikram', room: 'Room 306', type: 'Theory', color: '#10B981' },
      { period: 2, time: '09:20 - 10:05', subject: 'Mathematics', teacher: 'Harsh', room: 'Room 204', type: 'Theory', color: '#3B82F6' },
      { period: 3, time: '10:10 - 10:55', subject: 'Physics & Optics', teacher: 'Gaurav', room: 'Lab 3D-1', type: 'Lab', color: '#00F0FF' },
      { period: 4, time: '11:15 - 12:00', subject: 'English', teacher: 'Prof. Rajesh', room: 'Room 102', type: 'Theory', color: '#A855F7' },
      { period: 5, time: '12:05 - 12:50', subject: 'Chemistry', teacher: 'Dr. Sunita', room: 'Chem Lab 2', type: 'Practical', color: '#F59E0B' },
      { period: 6, time: '01:30 - 02:15', subject: 'Music', teacher: 'Prof. Meera', room: 'Music Hall', type: 'Practical', color: '#EC4899' }
    ],
    'Friday': [
      { period: 1, time: '08:30 - 09:15', subject: 'Physics Virtual Lab', teacher: 'Gaurav', room: 'Study Island 3D', type: 'Lab', color: '#00F0FF' },
      { period: 2, time: '09:20 - 10:05', subject: 'Mathematics', teacher: 'Harsh', room: 'Room 204', type: 'Theory', color: '#3B82F6' },
      { period: 3, time: '10:10 - 10:55', subject: 'Ancient History', teacher: 'Dr. Ananya', room: 'Room 305', type: 'Theory', color: '#F59E0B' },
      { period: 4, time: '11:15 - 12:00', subject: 'Earth Geography', teacher: 'Prof. Vikram', room: 'Room 306', type: 'Theory', color: '#10B981' },
      { period: 5, time: '12:05 - 12:50', subject: 'Sports & Fitness', teacher: 'Coach Vikram', room: 'Grounds', type: 'Sports', color: '#10B981' },
      { period: 6, time: '01:30 - 02:15', subject: 'Weekly Assessment', teacher: 'All Faculty', room: 'Main Hall', type: 'Exam', color: '#EF4444' }
    ]
  }
};

export default function TimeTable() {
  const [selectedClass, setSelectedClass] = useState('Class 6th A');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const periods = TIMETABLE_DATA[selectedClass]?.[selectedDay] || TIMETABLE_DATA['Class 6th A']['Monday'];

  const handleExport = () => {
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>Institutional Master Schedule</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Assign period slots, teachers, classrooms, and 3D simulation hours.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: copiedSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
              border: copiedSuccess ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
              color: copiedSuccess ? '#34d399' : '#cbd5e1',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {copiedSuccess ? <Check size={16} /> : <Download size={16} />}
            <span>{copiedSuccess ? 'Schedule Exported!' : 'Export Timetable'}</span>
          </button>
        </div>
      </div>

      {/* Class & Day Selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px', background: 'rgba(13, 20, 36, 0.75)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '700' }}>Select Section:</span>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: '#0a0f1d',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              color: '#00F0FF',
              fontWeight: '700',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {CLASSES.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: selectedDay === day ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.08)',
                background: selectedDay === day ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                color: selectedDay === day ? '#00F0FF' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Periods Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {periods.map(slot => (
          <Card key={slot.period}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  PERIOD {slot.period}
                </span>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: `${slot.color}15`,
                  border: `1px solid ${slot.color}40`,
                  color: slot.color,
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {slot.type}
                </span>
              </div>

              <div>
                <h4 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '700', margin: '0 0 6px 0' }}>
                  {slot.subject}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F0FF', fontSize: '0.85rem', fontWeight: '600' }}>
                  <Clock size={14} />
                  <span>{slot.time}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                  <User size={14} color="#a855f7" />
                  <span>{slot.teacher}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                  <MapPin size={14} />
                  <span>{slot.room}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
