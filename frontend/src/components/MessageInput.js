import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';
import { FiImage, FiVideo, FiMic, FiSend, FiX } from 'react-icons/fi';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, selectedUser }) => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const fileInputRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleSend = () => {
    if (message.trim() && !uploading) {
      onSendMessage('text', message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');

      if (!isImage && !isVideo && !isAudio) {
        alert('Please select an image, video, or audio file');
        setUploading(false);
        return;
      }

      const response = await uploadAPI.uploadFile(file);
      const type = isImage ? 'image' : isVideo ? 'video' : 'voice';
      
      onSendMessage(type, response.data.url, response.data.thumbnail || null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
        
        setUploading(true);
        try {
          const response = await uploadAPI.uploadFile(audioFile);
          onSendMessage('voice', response.data.url);
        } catch (error) {
          console.error('Upload error:', error);
          alert('Failed to upload voice note. Please try again.');
        } finally {
          setUploading(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleVideoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'video/*';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="message-input-container">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      <div className="message-input-actions">
        <button
          onClick={handleImageClick}
          className="action-button"
          disabled={uploading}
          title="Send image"
        >
          <FiImage />
        </button>
        <button
          onClick={handleVideoClick}
          className="action-button"
          disabled={uploading}
          title="Send video"
        >
          <FiVideo />
        </button>
        {!recording ? (
          <button
            onClick={startRecording}
            className="action-button"
            disabled={uploading}
            title="Record voice note"
          >
            <FiMic />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="action-button recording"
            title="Stop recording"
          >
            <FiX />
          </button>
        )}
      </div>

      <div className="message-input-wrapper">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={uploading ? 'Uploading...' : `Type a message to ${selectedUser?.username || 'user'}...`}
          disabled={uploading}
          rows={1}
          className="message-input"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || uploading}
          className="send-button"
          title="Send message"
        >
          <FiSend />
        </button>
      </div>
      
      {recording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          Recording... Click again to stop
        </div>
      )}
    </div>
  );
};

export default MessageInput;
