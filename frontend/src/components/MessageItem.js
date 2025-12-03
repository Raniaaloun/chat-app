import React from 'react';
import { FiImage, FiVideo, FiMic } from 'react-icons/fi';
import './MessageItem.css';

const MessageItem = ({ message, isOwn }) => {
  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return <div className="message-text">{message.content}</div>;

      case 'image':
        return (
          <div className="message-media">
            <img src={message.content} alt="Shared image" className="message-image" />
          </div>
        );

      case 'video':
        return (
          <div className="message-media">
            <video
              src={message.content}
              controls
              className="message-video"
              poster={message.thumbnail}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'voice':
        return (
          <div className="message-media">
            <audio src={message.content} controls className="message-audio">
              Your browser does not support the audio tag.
            </audio>
            <div className="audio-label">
              <FiMic /> Voice Note
            </div>
          </div>
        );

      default:
        return <div className="message-text">{message.content}</div>;
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className={`message-item ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        {!isOwn && (
          <div className="message-sender">{message.sender.username}</div>
        )}
        <div className="message-bubble">
          {renderMessageContent()}
          <div className="message-time">{formatTime(message.createdAt)}</div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
