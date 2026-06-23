import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Mail, Search, Users, Shield, Send, ArrowLeft, Megaphone } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';

export default function Inbox() {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'staff' | 'announcements'
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      localStorage.setItem('edtech_user', userParam);
      setCurrentUser(JSON.parse(userParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Fetch announcements
  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const anns = [];
      snapshot.forEach((doc) => anns.push({ id: doc.id, ...doc.data() }));
      setAnnouncements(anns);
    });
    return () => unsubscribe();
  }, []);

  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return;
    
    // In a real app, query by participants array containing currentUser.uid
    const q = query(collection(db, 'conversations'), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = [];
      snapshot.forEach((doc) => {
        convos.push({ id: doc.id, ...doc.data() });
      });
      setConversations(convos);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChat) return;

    const q = query(
      collection(db, `conversations/${activeChat.id}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    try {
      await addDoc(collection(db, `conversations/${activeChat.id}/messages`), {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.name || "Teacher",
        createdAt: serverTimestamp()
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const filteredConversations = conversations.filter(c => 
    activeTab === 'students' ? (c.type === 'student' || !c.type) : c.type === 'staff'
  );

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '50px' }}>
      <div className="view-header flex-between" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1>Inbox & Announcements</h1>
          <p>Manage your communications and stay up to date.</p>
        </div>
        
        {!activeChat && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '5px' }}>
              <button 
                onClick={() => setActiveTab('students')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 20px', borderRadius: '25px', border: 'none',
                  background: activeTab === 'students' ? 'var(--accent-cyan)' : 'transparent',
                  color: activeTab === 'students' ? '#000' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
                }}
              >
                <Users size={16} /> Students
              </button>
              <button 
                onClick={() => setActiveTab('staff')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 20px', borderRadius: '25px', border: 'none',
                  background: activeTab === 'staff' ? 'var(--accent-purple)' : 'transparent',
                  color: activeTab === 'staff' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
                }}
              >
                <Shield size={16} /> Staff
              </button>
              <button 
                onClick={() => setActiveTab('announcements')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 20px', borderRadius: '25px', border: 'none',
                  background: activeTab === 'announcements' ? 'var(--accent-blue)' : 'transparent',
                  color: activeTab === 'announcements' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
                }}
              >
                <Megaphone size={16} /> Updates
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Search..." style={{ padding: '10px 15px 10px 38px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white', width: '200px' }} />
            </div>
          </div>
        )}
      </div>

      <Card style={{ padding: activeChat || activeTab === 'announcements' ? '0' : '20px', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
        {activeTab === 'announcements' ? (
          <div style={{ padding: '30px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, marginBottom: '10px' }}>Global Announcements</h3>
            {announcements.length > 0 ? announcements.map(ann => (
              <div key={ann.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--accent-purple)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ color: '#fff', margin: 0 }}>{ann.title}</h4>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Just now'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{ann.text}</p>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>Posted by: {ann.author}</div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No announcements yet.</div>
            )}
          </div>
        ) : !activeChat ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredConversations.length > 0 ? filteredConversations.map(msg => (
              <li 
                key={msg.id} 
                onClick={() => setActiveChat(msg)}
                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderBottom: '1px solid var(--panel-border)', background: 'transparent', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid transparent' }}>
                  <Mail size={20} color="var(--text-secondary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <h4 style={{ margin: 0, fontWeight: 'normal', color: 'var(--text-primary)' }}>{msg.name || "Unknown"}</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{msg.lastMessage || "No messages yet"}</p>
                </div>
              </li>
            )) : (
              <li style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No conversations found. Ensure Firebase is configured.
              </li>
            )}
          </ul>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Chat Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={() => setActiveChat(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <ArrowLeft size={20} />
              </button>
              <h3 style={{ margin: 0 }}>{activeChat.name}</h3>
            </div>
            
            {/* Messages */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.map((msg) => {
                const isMe = currentUser && msg.senderId === currentUser.uid;
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ 
                      background: isMe ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', 
                      padding: '10px 15px', borderRadius: '15px', color: '#fff' 
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '5px', textAlign: isMe ? 'right' : 'left' }}>
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid var(--panel-border)', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..." 
                style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '8px', outline: 'none' }} 
              />
              <button type="submit" style={{ padding: '12px 20px', background: 'var(--accent-purple)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
