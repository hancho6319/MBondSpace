import { format } from 'date-fns';
import styles from '../styles/components/Message.module.css';

export default function Message({ 
  message, 
  isCurrentUser,
  onReply,
  onShowAttachment
}) {
  // Safely parse the timestamp with comprehensive fallbacks
  const getValidTimestamp = () => {
    try {
      if (!message.timestamp) return new Date();
      if (typeof message.timestamp === 'function' && message.timestamp.toDate) {
        return message.timestamp.toDate();
      }
      if (message.timestamp instanceof Date) return message.timestamp;
      if (typeof message.timestamp === 'number' || typeof message.timestamp === 'string') {
        return new Date(message.timestamp);
      }
      return new Date();
    } catch (e) {
      console.error('Error parsing timestamp:', e);
      return new Date();
    }
  };

  const timestamp = getValidTimestamp();

  // Safe extraction of message data with fallbacks
  const senderName = message.senderName || 'Anonymous';
  const senderPhoto = message.senderPhotoURL || '/default-avatar.png';
  const replyToName = message.replyTo?.senderName || 'User';
  const replyToText = message.replyTo?.text || '';
  const attachment = message.attachment || null;

  const handleAttachmentClick = () => {
    if (onShowAttachment && attachment) {
      onShowAttachment(attachment);
    }
  };

  const handleReplyClick = () => {
    if (onReply) {
      onReply({
        id: message.id,
        text: message.text,
        senderName,
        senderPhotoURL: senderPhoto
      });
    }
  };

  return (
    <div className={`${styles.message} ${isCurrentUser ? styles.currentUser : ''}`}>
      {message.replyTo && (
        <div className={styles.replyPreview}>
          <div className={styles.replyContent}>
            <strong>{replyToName}:</strong> 
            {replyToText.substring(0, 50)}
            {replyToText.length > 50 ? '...' : ''}
          </div>
        </div>
      )}
      
      <div className={styles.messageContent}>
        {!isCurrentUser && (
          <div className={styles.senderInfo}>
            <img 
              src={senderPhoto} 
              alt={senderName} 
              className={styles.senderAvatar}
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <span className={styles.senderName}>{senderName}</span>
          </div>
        )}
        
        <div className={styles.messageBody}>
          {message.text && (
            <p className={styles.messageText}>
              {message.text}
            </p>
          )}
          
          {attachment && (
            <div className={styles.attachmentContainer}>
              {attachment.type?.startsWith('image/') ? (
                <img 
                  src={attachment.url} 
                  alt="Attachment" 
                  className={styles.attachmentImage}
                  onClick={handleAttachmentClick}
                  onError={(e) => {
                    e.target.src = '/image-placeholder.png';
                  }}
                />
              ) : (
                <div 
                  className={styles.fileAttachment}
                  onClick={handleAttachmentClick}
                >
                  <div className={styles.fileIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                    </svg>
                  </div>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>
                      {attachment.name || 'File Attachment'}
                    </div>
                    <div className={styles.fileSize}>
                      {formatFileSize(attachment.size)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.messageMeta}>
          <span className={styles.messageTime}>
            {format(timestamp, 'h:mm a')}
          </span>
          
          <div className={styles.messageOptions}>
            <button 
              className={styles.optionButton}
              onClick={handleReplyClick}
              title="Reply"
              aria-label="Reply to message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M5.337 21.718a6.707 6.707 0 01-.533-.074.75.75 0 01-.44-1.223 3.73 3.73 0 00.814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 01-4.246.997z" clipRule="evenodd" />
              </svg>
            </button>
            
            {attachment && (
              <button 
                className={styles.optionButton}
                onClick={handleAttachmentClick}
                title="View Attachment"
                aria-label="View attachment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format file sizes
function formatFileSize(bytes) {
  if (bytes === undefined || bytes === null) return '0 bytes';
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}