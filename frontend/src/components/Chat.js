import React, { useState, useEffect, useRef } from 'react';
import { initializeSocket, getSocket, disconnectSocket } from '../services/socket';
import { authAPI, messagesAPI } from '../services/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './Chat.css';
import { FiLogOut, FiUsers } from 'react-icons/fi';

const Chat = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    if (token) {
      socketRef.current = initializeSocket(token);
      
      // Socket event listeners
      socketRef.current.on('receive_message', (message) => {
        if (
          selectedUser &&
          (message.sender._id === selectedUser._id || message.receiver._id === selectedUser._id)
        ) {
          setMessages((prev) => {
            // Check if message already exists
            const exists = prev.some(m => m._id === message._id);
            if (exists) {
              return prev.map(m => m._id === message._id ? message : m);
            }
            return [...prev, message];
          });
          
          // Mark as read if viewing the conversation
          if (message.sender._id === selectedUser._id) {
            socketRef.current.emit('mark_as_read', { senderId: selectedUser._id });
          }
        }
      });

      socketRef.current.on('message_sent', (message) => {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(m => m._id === message._id);
          if (exists) {
            return prev.map(m => m._id === message._id ? message : m);
          }
          return [...prev, message];
        });
      });

      // Handle delivery status updates
      socketRef.current.on('message_delivered', (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId ? { ...m, delivered: true } : m
          )
        );
      });

      // Handle read status updates
      socketRef.current.on('messages_read', (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            data.messageIds.includes(m._id) ? { ...m, read: true } : m
          )
        );
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    // Load users
    loadUsers();

    return () => {
      if (socketRef.current) {
        disconnectSocket();
      }
    };
  }, []);

  useEffect(() => {
    // Load messages when user is selected
    if (selectedUser) {
      loadMessages(selectedUser._id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data.users);
      setLoading(false);
      
      // Auto-select first user if available
      if (response.data.users.length > 0 && !selectedUser) {
        setSelectedUser(response.data.users[0]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await messagesAPI.getMessages(userId);
      setMessages(response.data.messages);
      
      // Mark messages as read via socket
      if (socketRef.current) {
        socketRef.current.emit('mark_as_read', { senderId: userId });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = (type, content, thumbnail = null) => {
    if (!selectedUser || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      receiverId: selectedUser._id,
      type,
      content,
      thumbnail,
    });
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <h3>{user.username}</h3>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          <button onClick={onLogout} className="logout-button" title="Logout">
            <FiLogOut />
          </button>
        </div>
        
        <div className="users-list">
          <div className="users-list-header">
            <FiUsers />
            <span>{user.role === 'montaser' ? 'All Users' : 'Chat'}</span>
          </div>
          {loading ? (
            <div className="loading-users">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="no-users">No users available</div>
          ) : (
            users.map((u) => (
              <div
                key={u._id || u.id}
                className={`user-item ${selectedUser?._id === u._id ? 'active' : ''}`}
                onClick={() => handleUserSelect(u)}
              >
                <div className="user-avatar">{u.username.charAt(0).toUpperCase()}</div>
                <div className="user-item-info">
                  <div className="user-item-name">{u.username}</div>
                  <div className="user-item-role">{u.role}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="user-avatar">{selectedUser.username.charAt(0).toUpperCase()}</div>
                <div>
                  <h3>{selectedUser.username}</h3>
                  <span className="chat-user-role">{selectedUser.role}</span>
                </div>
              </div>
            </div>
            <MessageList
              messages={messages}
              currentUserId={String(user._id || user.id)}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              selectedUser={selectedUser}
            />
          </>
        ) : (
          <div className="chat-empty">
            <FiUsers size={64} />
            <h2>Select a user to start chatting</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
