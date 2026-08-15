import React, { useState } from 'react';
import { Calendar, Plus, MapPin, Clock, Users, Tag, Filter, CheckCircle2, ChevronRight, X } from 'lucide-react';
import Card from '../components/Card';

const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: 'Science Fair & 3D Optics Expo 2026',
    category: 'Academic',
    date: '28 Jun 2026',
    time: '11:00 AM - 04:00 PM',
    location: 'Main Auditorium & Virtual Lab 3',
    organizer: 'Gaurav (Head of Science)',
    attendees: 340,
    status: 'Upcoming',
    description: 'Annual interactive physics exhibition showcasing student-built Three.js optics and raymarching experiments.',
    color: '#00F0FF'
  },
  {
    id: 'evt-2',
    title: 'Mid-Term Examinations Begin',
    category: 'Examinations',
    date: '15 Jun 2026',
    time: '08:00 AM - 01:30 PM',
    location: 'All Examination Halls (Grades 6-10)',
    organizer: 'Academic Examination Board',
    attendees: 1250,
    status: 'Upcoming',
    description: 'Standardized summative assessments across Mathematics, Sciences, and Social Studies.',
    color: '#EF4444'
  },
  {
    id: 'evt-3',
    title: 'Parent-Teacher Strategic Council',
    category: 'Parent Meets',
    date: '02 Jul 2026',
    time: '09:00 AM - 01:00 PM',
    location: 'Virtual Conference Room 101',
    organizer: 'Immersion Labs Administration',
    attendees: 520,
    status: 'Scheduled',
    description: 'Quarterly review of AI tutoring telemetry, student attendance trajectories, and term performance.',
    color: '#A855F7'
  },
  {
    id: 'evt-4',
    title: 'Inter-School Robotic & AI Hackathon',
    category: 'Extracurricular',
    date: '10 Jul 2026',
    time: '10:00 AM - 06:00 PM',
    location: 'Innovation Hub Lab A',
    organizer: 'Robotics Department',
    attendees: 180,
    status: 'Upcoming',
    description: '48-hour hands-on coding and robotics challenge with participating NCR schools.',
    color: '#10B981'
  }
];

export default function Events() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [filter, setFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Academic',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  const filteredEvents = events.filter(e => {
    if (filter === 'ALL') return true;
    return e.category.toLowerCase() === filter.toLowerCase();
  });

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    const created = {
      ...newEvent,
      id: `evt-${Date.now()}`,
      organizer: 'Administrator',
      attendees: 1,
      status: 'Upcoming',
      color: newEvent.category === 'Examinations' ? '#EF4444' : newEvent.category === 'Academic' ? '#00F0FF' : '#10B981'
    };
    setEvents([created, ...events]);
    setShowAddModal(false);
    setNewEvent({ title: '', category: 'Academic', date: '', time: '', location: '', description: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>School Events &amp; Operations Calendar</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Schedule institutional fairs, examination terms, and parent conferences.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)'
            }}
          >
            <Plus size={18} />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['ALL', 'Academic', 'Examinations', 'Parent Meets', 'Extracurricular'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: filter === cat ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.08)',
              background: filter === cat ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.03)',
              color: filter === cat ? '#00F0FF' : '#94a3b8',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cat === 'ALL' ? '📅 All Events' : cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredEvents.map(evt => (
          <Card key={evt.id}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: `${evt.color}15`,
                    border: `1px solid ${evt.color}40`,
                    color: evt.color,
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {evt.category}
                  </span>
                  <span style={{
                    color: '#34d399',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle2 size={14} /> {evt.status}
                  </span>
                </div>

                <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                  {evt.title}
                </h4>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                  {evt.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.8rem' }}>
                    <Calendar size={15} color="#00F0FF" />
                    <span>{evt.date}</span>
                    <span style={{ color: '#64748b' }}>•</span>
                    <Clock size={15} color="#00F0FF" />
                    <span>{evt.time}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.8rem' }}>
                    <MapPin size={15} color="#a855f7" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                  <Users size={15} />
                  <span><strong>{evt.attendees}</strong> Attendees Expected</span>
                </div>

                <button
                  onClick={() => setSelectedEvent(evt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: '#00F0FF',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <span>Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal: Create Event */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '28px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', pb: '12px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>Schedule New Event</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Day 2026"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Category</label>
                  <select
                    value={newEvent.category}
                    onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examinations">Examinations</option>
                    <option value="Parent Meets">Parent Meets</option>
                    <option value="Extracurricular">Extracurricular</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 Jul 2026"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Time Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 02:00 PM"
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Location / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Virtual Room 101"
                    value={newEvent.location}
                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Overview of the event agenda..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00F0FF, #3B82F6)', border: 'none', color: '#000', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Event Details */}
      {selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0a0f1d', border: `1px solid ${selectedEvent.color}50`, borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '28px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '8px', background: `${selectedEvent.color}20`, color: selectedEvent.color, fontWeight: '700', fontSize: '0.8rem' }}>
                {selectedEvent.category}
              </span>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 12px 0' }}>{selectedEvent.title}</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 20px 0' }}>{selectedEvent.description}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Date &amp; Time:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>{selectedEvent.date} ({selectedEvent.time})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Venue:</span>
                <span style={{ color: '#00F0FF', fontWeight: '700' }}>{selectedEvent.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Organizer:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>{selectedEvent.organizer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Registered Attendees:</span>
                <span style={{ color: '#34d399', fontWeight: '700' }}>{selectedEvent.attendees} Students &amp; Faculty</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
