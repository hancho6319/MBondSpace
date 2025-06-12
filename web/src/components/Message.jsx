import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import styles from '../styles/components/Message.module.css';

export default function Message({ 
  message, 
  isCurrentUser,
  onReply,
  onShowAttachment
}) {
  const { currentUser } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  
  const handleReply = () => {
    if (onReply) onReply(message);
    setShowOptions(false);
  };

  const handleShowAttachment = () => {
    if (onShowAttachment) onShowAttachment(message.attachment);
    setShowOptions(false);
  };

  return (
    <div 
      className={`${styles.message} ${isCurrentUser ? styles.currentUser : ''}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {message.replyTo && (
        <div className={styles.replyPreview}>
          <div className={styles.replyContent}>
            <strong>{message.replyTo.senderName || 'User'}:</strong> 
            {message.replyTo.text.substring(0, 50)}
            {message.replyTo.text.length > 50 && '...'}
          </div>
        </div>
      )}
      
      <div className={styles.messageContent}>
        {!isCurrentUser && (
          <div className={styles.senderInfo}>
            <img 
              src={message.senderPhotoURL || '/default-avatar.png'} 
              alt={message.senderName} 
              className={styles.senderAvatar}
            />
            <span className={styles.senderName}>{message.senderName}</span>
          </div>
        )}
        
        <div className={styles.messageBody}>
          {message.text && <p className={styles.messageText}>{message.text}</p>}
          
          {message.attachment && (
            <div className={styles.attachmentContainer}>
              {message.attachment.type.startsWith('image/') ? (
                <img 
                  src={message.attachment.url} 
                  alt="Attachment" 
                  className={styles.attachmentImage}
                  onClick={handleShowAttachment}
                />
              ) : (
                <div 
                  className={styles.fileAttachment}
                  onClick={handleShowAttachment}
                >
                  <div className={styles.fileIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                    </svg>
                  </div>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{message.attachment.name}</div>
                    <div className={styles.fileSize}>{formatFileSize(message.attachment.size)}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {message.voiceNote && (
            <div className={styles.voiceNote}>
              <button className={styles.playButton}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </button>
              <div className={styles.voiceDuration}>
                {formatDuration(message.voiceNote.duration)}
              </div>
              <div className={styles.voiceWaveform}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={styles.voiceBar} 
                    style={{ height: `${Math.random() * 30 + 10}px` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.messageMeta}>
          <span className={styles.messageTime}>
            {format(message.timestamp?.toDate(), 'h:mm a')}
          </span>
          
          {showOptions && (
            <div className={styles.messageOptions}>
              <button 
                className={styles.optionButton}
                onClick={handleReply}
                title="Reply"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M5.337 21.718a6.707 6.707 0 01-.533-.074.75.75 0 01-.44-1.223 3.73 3.73 0 00.814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 01-4.246.997z" clipRule="evenodd" />
                </svg>
              </button>
              
              {message.attachment && (
                <button 
                  className={styles.optionButton}
                  onClick={handleShowAttachment}
                  title="View Attachment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}