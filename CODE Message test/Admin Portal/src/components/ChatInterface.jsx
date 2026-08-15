import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, MoreVertical, MessageSquare, CheckCheck, UserCheck } from 'lucide-react';
import { supabase } from '../supabase';
import './ChatInterface.css';

export default function ChatInterface({ currentUser: propUser, activeTab, onUnreadCountChange }) {
  // Resolve current logged-in user with robust fallback
  const [currentUser, setCurrentUser] = useState(() => {
    if (propUser) return propUser;
    try {
      const stored = localStorage.getItem('edtech_user');
      return stored ? JSON.parse(stored) : { email: 'immersionlabsindia@gmail.com', name: 'Immersion Labs', role: 'admin' };
    } catch (e) {
      return { email: 'immersionlabsindia@gmail.com', name: 'Immersion Labs', role: 'admin' };
    }
  });

  useEffect(() => {
    if (propUser) setCurrentUser(propUser);
  }, [propUser]);

  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // 'all' | 'students' | 'teachers'
  
  const [activeContact, setActiveContact] = useState(null); // { id, name, email, role, avatar_url }
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch All Database Users from Supabase (profiles & users tables)
  const fetchProfiles = async () => {
    try {
      const { data: profData } = await supabase.from('profiles').select('*').order('name');
      const { data: userData } = await supabase.from('users').select('*');
      
      const combinedMap = new Map();
      
      // Add from users table
      if (userData && userData.length > 0) {
        userData.forEach(u => {
          const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
          combinedMap.set(u.email, {
            id: u.id,
            name: name,
            email: u.email,
            role: u.role || 'student',
            avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(u.email)}&backgroundColor=0a0f1d`
          });
        });
      }

      // Add from profiles table (overriding or supplementing)
      if (profData && profData.length > 0) {
        profData.forEach(p => {
          combinedMap.set(p.email, {
            id: p.id,
            name: p.name || p.email,
            email: p.email,
            role: p.role || 'student',
            avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(p.email)}&backgroundColor=0a0f1d`
          });
        });
      }

      setProfiles(Array.from(combinedMap.values()));
    } catch (err) {
      console.error("Error fetching profiles from Supabase:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    
    // Real-time listener for profiles changes in Supabase
    const profilesSub = supabase.channel('public:profiles_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchProfiles)
      .subscribe();

    const usersSub = supabase.channel('public:users_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchProfiles)
      .subscribe();
      
    return () => { 
      supabase.removeChannel(profilesSub); 
      supabase.removeChannel(usersSub);
    };
  }, [currentUser]);

  // 2. Fetch Unread Counts from Supabase Messages
  const fetchUnreadCounts = async () => {
    if (!currentUser?.email) return;
    
    try {
      const { data: myConvs } = await supabase.from('conversations')
        .select('id, participant1_email, participant2_email')
        .or(`participant1_email.eq.${currentUser.email},participant2_email.eq.${currentUser.email}`);
        
      if (!myConvs || myConvs.length === 0) return;
      const convIds = myConvs.map(c => c.id);
      
      const { data: unreadMsgs } = await supabase.from('messages')
        .select('senderEmail, conversationId')
        .in('conversationId', convIds)
        .eq('is_read', false)
        .neq('senderEmail', currentUser.email);
        
      if (unreadMsgs) {
        const counts = {};
        unreadMsgs.forEach(msg => {
          counts[msg.senderEmail] = (counts[msg.senderEmail] || 0) + 1;
        });
        setUnreadCounts(counts);
        
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        if (onUnreadCountChange) {
          onUnreadCountChange({ chat: total, total });
        }
      }
    } catch (err) {
      console.error("Error fetching unread counts:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCounts();
    
    // Realtime subscription for incoming unread messages
    const unreadSub = supabase.channel('public:messages_unread_sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.senderEmail !== currentUser?.email) {
          fetchUnreadCounts();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => {
        fetchUnreadCounts();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(unreadSub); };
  }, [currentUser]);

  // 3. Filter Direct Contacts based on role and search query
  useEffect(() => {
    if (!profiles) return;
    
    // Exclude current logged in admin user
    let baseList = profiles.filter(p => !currentUser?.email || p.email !== currentUser.email);

    let result = [];
    if (filterRole === 'students') {
      result = baseList.filter(p => p.role === 'student');
    } else if (filterRole === 'teachers') {
      result = baseList.filter(p => p.role === 'teacher' || p.role === 'admin');
    } else {
      // 'all'
      result = baseList;
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.email && p.email.toLowerCase().includes(q))
      );
    }
    
    setFilteredProfiles(result);
  }, [profiles, filterRole, searchQuery, currentUser]);

  // 4. Fetch or Create 1-on-1 Direct Conversation in Supabase
  useEffect(() => {
    if (!activeContact || !currentUser?.email) return;

    const fetchOrCreateConversation = async () => {
      try {
        const { data, error } = await supabase.from('conversations')
          .select('*')
          .or(`and(participant1_email.eq.${currentUser.email},participant2_email.eq.${activeContact.email}),and(participant1_email.eq.${activeContact.email},participant2_email.eq.${currentUser.email})`)
          .maybeSingle();
          
        if (data) {
          setCurrentConversation(data);
        } else {
          // Create new direct conversation record
          const { data: newConv, error: createErr } = await supabase.from('conversations')
            .insert({ 
              participant1_email: currentUser.email, 
              participant2_email: activeContact.email,
              type: 'direct',
              lastMessage: 'Conversation opened'
            })
            .select()
            .single();
            
          if (newConv) setCurrentConversation(newConv);
          if (createErr) console.error("Error creating direct conversation:", createErr);
        }
      } catch (err) {
        console.error("Error in fetchOrCreateConversation:", err);
      }
    };
    fetchOrCreateConversation();
  }, [activeContact, currentUser]);

  // 5. Fetch Messages & Realtime Subscription for Active Conversation
  const fetchMessages = async () => {
    if (!currentConversation?.id) return;
    try {
      const { data } = await supabase.from('messages')
        .select('*')
        .eq('conversationId', currentConversation.id)
        .order('createdAt', { ascending: true });
      
      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    if (!currentConversation?.id) return;
    
    const messagesSub = supabase.channel(`public:messages:${currentConversation.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversationId=eq.${currentConversation.id}` 
      }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        setTimeout(scrollToBottom, 50);
        
        // Auto mark as read if message is received while chat is currently open
        if (payload.new.senderEmail !== currentUser?.email) {
          supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id).then(() => fetchUnreadCounts());
        }
      })
      .subscribe();
      
    return () => { supabase.removeChannel(messagesSub); };
  }, [currentConversation]);

  // Mark all unread messages as read when conversation is opened
  useEffect(() => {
    if (!currentConversation?.id || !activeContact?.email || !currentUser?.email) return;
    
    const markAsRead = async () => {
      try {
        await supabase.from('messages')
          .update({ is_read: true })
          .eq('conversationId', currentConversation.id)
          .neq('senderEmail', currentUser.email)
          .eq('is_read', false);
          
        setUnreadCounts(prev => ({ ...prev, [activeContact.email]: 0 }));
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };
    markAsRead();
  }, [currentConversation, activeContact, currentUser]);

  // 6. Send Message directly to Supabase
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation?.id || !currentUser?.email || isSending) return;
    
    const msgText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    
    try {
      const { data: insertedMsg, error: msgError } = await supabase.from('messages').insert({
        conversationId: currentConversation.id,
        senderEmail: currentUser.email,
        senderName: currentUser.name || "Administrator",
        text: msgText,
        is_read: false
      }).select().single();
      
      if (msgError) throw msgError;

      setMessages(prev => {
        if (prev.some(m => m.id === insertedMsg.id)) return prev;
        return [...prev, insertedMsg];
      });
      setTimeout(scrollToBottom, 50);

      await supabase.from('conversations')
        .update({ lastMessage: msgText, updatedAt: new Date() })
        .eq('id', currentConversation.id);
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(msgText);
      alert('Message failed to send: ' + (err.message || 'Network error'));
    } finally {
      setIsSending(false);
    }
  };

  const studentCount = profiles.filter(p => p.role === 'student' && p.email !== currentUser?.email).length;
  const facultyCount = profiles.filter(p => (p.role === 'teacher' || p.role === 'admin') && p.email !== currentUser?.email).length;
  const totalCount = profiles.filter(p => p.email !== currentUser?.email).length;

  return (
    <div className="chat-interface-container">
      {/* Left Pane: Contacts List */}
      <div className={`chat-sidebar ${activeContact ? 'hidden-mobile' : ''}`}>
        <div className="chat-sidebar-header">
          <div className="chat-search-wrapper">
            <Search size={16} className="chat-search-icon" />
            <input 
              type="text" 
              placeholder="Search contacts by name or email..." 
              className="chat-search-input" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        {/* Filter Category Chips (Students & Faculty) */}
        <div className="chat-filter-chips">
          <button 
            type="button"
            className={`chat-chip ${filterRole === 'all' ? 'active' : ''}`}
            onClick={() => setFilterRole('all')}
          >
            All ({totalCount})
          </button>
          <button 
            type="button"
            className={`chat-chip ${filterRole === 'students' ? 'active' : ''}`}
            onClick={() => setFilterRole('students')}
          >
            Students ({studentCount})
          </button>
          <button 
            type="button"
            className={`chat-chip ${filterRole === 'teachers' ? 'active' : ''}`}
            onClick={() => setFilterRole('teachers')}
          >
            Faculty ({facultyCount})
          </button>
        </div>
        
        {/* Contact List */}
        <div className="chat-contacts-list">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map(contact => {
              const unread = unreadCounts[contact.email] || 0;
              const isSelected = activeContact?.email === contact.email;
              return (
                <div 
                  key={contact.id || contact.email} 
                  className={`chat-contact-item ${isSelected ? 'active' : ''}`} 
                  onClick={() => setActiveContact(contact)}
                >
                  <div className="chat-contact-avatar">
                    <img 
                      src={contact.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(contact.email || contact.name)}&backgroundColor=0a0f1d`} 
                      alt={contact.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(contact.email || contact.name)}&backgroundColor=0a0f1d`;
                      }}
                    />
                  </div>
                  <div className="chat-contact-info">
                    <div className="chat-contact-name-row">
                      <span className="chat-contact-name">{contact.name}</span>
                      {unread > 0 && <span className="unread-badge">{unread}</span>}
                      <span className={`chat-contact-role role-${contact.role || 'student'}`}>
                        {contact.role || 'student'}
                      </span>
                    </div>
                    <span className="chat-contact-email">{contact.email}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="chat-empty-state">
              No matching database contacts found.
            </div>
          )}
        </div>
      </div>
      
      {/* Right Pane: Active 1-on-1 Chat Area */}
      <div className={`chat-main-area ${!activeContact ? 'hidden-mobile' : ''}`}>
        {activeContact ? (
          <>
            <div className="chat-main-header">
              <button className="chat-back-btn" onClick={() => setActiveContact(null)}>
                <ArrowLeft size={20} />
              </button>
              <div className="chat-header-avatar">
                <img 
                  src={activeContact.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(activeContact.email || activeContact.name)}&backgroundColor=0a0f1d`} 
                  alt={activeContact.name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(activeContact.email || activeContact.name)}&backgroundColor=0a0f1d`;
                  }}
                />
              </div>
              <div className="chat-header-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4>{activeContact.name}</h4>
                  <span className={`chat-contact-role role-${activeContact.role || 'student'}`}>
                    {activeContact.role || 'student'}
                  </span>
                </div>
                <span>{activeContact.email} • Direct Supabase Channel</span>
              </div>
              <div className="chat-header-actions">
                <span style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                  Live Connected
                </span>
              </div>
            </div>
            
            <div className="chat-messages-area">
              {messages.length === 0 ? (
                <div className="chat-messages-empty">
                  <MessageSquare size={24} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                  <div>No messages exchanged yet with <strong>{activeContact.name}</strong>.</div>
                  <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>Send a message below to initiate this direct conversation.</div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderEmail === currentUser.email;
                  return (
                    <div key={msg.id || idx} className={`chat-bubble-wrapper ${isMe ? 'is-me' : 'is-them'}`}>
                      <div className="chat-bubble">
                        <div className="chat-bubble-text">{msg.text}</div>
                        <div className="chat-bubble-time">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          {isMe && <CheckCheck size={13} style={{ marginLeft: '4px', verticalAlign: 'middle', color: '#00F0FF' }} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder={`Type a direct message to ${activeContact.name}...`} 
                className="chat-input" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                disabled={isSending}
              />
              <button 
                type="submit" 
                className="chat-send-btn" 
                disabled={!newMessage.trim() || isSending}
                title="Send Message"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder-area">
            <div className="chat-placeholder-content">
              <div className="chat-placeholder-icon">💬</div>
              <h3>Select a User Conversation</h3>
              <p>Choose a student or faculty member from the left menu to start direct real-time messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
