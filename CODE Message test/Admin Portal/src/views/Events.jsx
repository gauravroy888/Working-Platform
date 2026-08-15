import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Clock, Users, Tag, Filter, CheckCircle2, ChevronRight, X, Loader2, AlertCircle, Volume2 } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '../supabase';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Academic',
    description: '',
    author: 'Immersion Labs'
  });

  const loadDatabaseEvents = async () => {
    setLoading(true);
    try {
      // 1. Fetch from announcements
      const { data: dbAnnouncements, error: annErr } = await supabase
        .from('announcements')
        .select('*');

      // 2. Fetch from live_classes
      const { data: dbLiveClasses } = await supabase
        .from('live_classes')
        .select('*');

      let combined = [];

      if (dbAnnouncements && dbAnnouncements.length > 0) {
        dbAnnouncements.forEach((a, idx) => {
          const colors = ['#00F0FF', '#3B82F6', '#A855F7', '#10B981', '#F59E0B'];
          const dateStr = a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today';
          const timeStr = a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM';

          combined.push({
            id: a.id || `ann-${idx}`,
            title: a.title || 'Institutional Notice',
            category: 'Announcement',
            date: dateStr,
            time: timeStr,
            location: 'Platform Broadcast / Virtual Hub',
            organizer: a.author || 'Immersion Labs',
            attendees: 150,
            status: 'Active',
            description: a.text || 'Official platform announcement.',
            color: colors[idx % colors.length]
          });
        });
      }

      if (dbLiveClasses && dbLiveClasses.length > 0) {
        dbLiveClasses.forEach((lc, idx) => {
          combined.push({
            id: lc.id || `lc-${idx}`,
            title: lc.title || 'Live 3D Classroom Session',
            category: 'Academic',
            date: lc.scheduled_at ? new Date(lc.scheduled_at).toLocaleDateString() : 'Scheduled',
            time: '02:00 PM',
            location: 'Study Island 3D Simulation Room',
            organizer: lc.teacher_name || 'Faculty Member',
            attendees: 45,
            status: lc.status || 'Upcoming',
            description: lc.description || 'Live immersive interactive 3D physics and mathematics session.',
            color: '#10B981'
          });
        });
      }

      setEvents(combined);
    } catch (e) {
      console.error('Error loading events:', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    if (filter === 'ALL') return true;
    return e.category.toLowerCase() === filter.toLowerCase();
  });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.description) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([
          {
            title: newEvent.title.trim(),
            text: newEvent.description.trim(),
            author: newEvent.author || 'Immersion Labs'
          }
        ]);

      if (error) throw error;

      setFeedbackMsg({ type: 'success', text: `Event/Announcement "${newEvent.title}" published to database!` });
      setTimeout(() => setFeedbackMsg(null), 4000);
      setShowAddModal(false);
      setNewEvent({ title: '', category: 'Academic', description: '', author: 'Immersion Labs' });
      await loadDatabaseEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to publish event: ' + (err.message || '') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>School Events &amp; Announcements</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Live institutional broadcasts and scheduled sessions from Supabase ({events.length} active).
          </p>
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
              color: '#00F0FF',
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
            <span>Create New Notice / Event</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: feedbackMsg.type === 'success' ? '1px solid #10B981' : '1px solid #EF4444',
          color: feedbackMsg.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['ALL', 'Announcement', 'Academic'].map(cat => (
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
            {cat === 'ALL' ? '📅 All Events & Notices' : cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px', color: '#00F0FF' }}>
          <Loader2 size={28} className="animate-spin" />
          <span style={{ fontSize: '1rem', fontWeight: '600' }}>Fetching real events from database...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEvents.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Calendar size={48} color="#64748b" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 8px 0' }}>No Events or Notices Found</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 20px auto' }}>
              No announcements published in the database yet. Click below to schedule or publish your first event notice.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Publish First Notice
            </button>
          </div>
        </Card>
      )}

      {/* Events Grid */}
      {!loading && filteredEvents.length > 0 && (
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
                    <Volume2 size={15} color="#00F0FF" />
                    <span>Author: <strong>{evt.organizer}</strong></span>
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
      )}

      {/* Modal: Create Notice / Event */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '28px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>Publish Real Notice / Event</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Examinations Schedule Announced"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Author / Publisher</label>
                <input
                  type="text"
                  placeholder="e.g. Immersion Labs Administration"
                  value={newEvent.author}
                  onChange={e => setNewEvent({ ...newEvent, author: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Content / Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed announcement content visible to all students and faculty..."
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
                  disabled={isSubmitting}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00F0FF, #3B82F6)', border: 'none', color: '#000', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving to Database...' : 'Publish to Supabase'}
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
                <span style={{ color: '#94a3b8' }}>Published Date:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>{selectedEvent.date} ({selectedEvent.time})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Channel:</span>
                <span style={{ color: '#00F0FF', fontWeight: '700' }}>{selectedEvent.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Publisher:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>{selectedEvent.organizer}</span>
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
