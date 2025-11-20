import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import './MessageList.css';

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const senderId = String(message.sender._id || message.sender.id);
          return (
            <MessageItem
              key={message._id}
              message={message}
              isOwn={senderId === currentUserId}
            />
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
