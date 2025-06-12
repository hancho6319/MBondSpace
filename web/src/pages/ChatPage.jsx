import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection,
  db,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from '../services/firebase';
import GroupHeader from '../components/GroupHeader';
import Message from '../components/Message';
import TypingIndicator from '../components/TypingIndicator';
import styles from './ChatPage.module.css';

export default function ChatPage() {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;
    
    const q = query(
      collection(db, 'groups', groupId, 'messages'),
      orderBy('timestamp')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });
    
    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    // In a real app, you'd send a "typing" event to the server
    // Here we're just simulating it locally
    if (!typingUsers.some(u => u.id === currentUser.uid)) {
      setTypingUsers(prev => [...prev, {
        id: currentUser.uid,
        name: currentUser.displayName
      }]);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indication
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers(prev => prev.filter(u => u.id !== currentUser.uid));
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;
    
    try {
      const messageData = {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhotoURL: currentUser.photoURL,
        timestamp: serverTimestamp(),
        replyTo: replyingTo,
        attachment: attachment
      };

      await addDoc(collection(db, 'groups', groupId, 'messages'), messageData);
      
      // Reset state
      setNewMessage('');
      setReplyingTo(null);
      setAttachment(null);
      
      // Stop typing indication
      setTypingUsers(prev => prev.filter(u => u.id !== currentUser.uid));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    scrollToBottom();
  };

  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real app, you'd upload the file to Firebase Storage
    // and get a download URL. Here we're using a mock object.
    setAttachment({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file) // Temporary local URL
    });
  };

  const startRecording = () => {
    // In a real app, you'd use the Web Audio API to record
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // In a real app, you'd upload the audio and get a URL
    // Here we're using a mock object
    setAttachment({
      type: 'audio/mp3',
      duration: 15.4, // seconds
      url: 'https://example.com/voice-note.mp3' // Mock URL
    });
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className={styles.chatPage}>
      <GroupHeader groupId={groupId} />
      
      <div className={styles.chatContainer}>
        <div className={styles.messagesContainer}>
          {messages.map(message => (
            <Message 
              key={message.id} 
              message={message} 
              isCurrentUser={message.senderId === currentUser?.uid}
              onReply={handleReply}
            />
          ))}
          
          <TypingIndicator users={typingUsers} />
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className={styles.inputContainer}>
          {replyingTo && (
            <div className={styles.replyPreview}>
              <div className={styles.replyContent}>
                Replying to {replyingTo.senderName}: 
                {replyingTo.text.substring(0, 50)}
                {replyingTo.text.length > 50 && '...'}
              </div>
              <button 
                className={styles.cancelReply}
                onClick={cancelReply}
              >
                &times;
              </button>
            </div>
          )}
          
          <div className={styles.inputArea}>
            <div className={styles.attachmentButtons}>
              <label className={styles.attachmentButton}>
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={handleAttachment}
                  style={{ display: 'none' }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                </svg>
              </label>
              
              {isRecording ? (
                <button 
                  className={styles.recordButtonActive}
                  onClick={stopRecording}
                >
                  <div className={styles.recordingIndicator}></div>
                  Stop
                </button>
              ) : (
                <button 
                  className={styles.recordButton}
                  onClick={startRecording}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                  </svg>
                </button>
              )}
            </div>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className={styles.messageInput}
            />
            
            <button 
              type="submit" 
              className={styles.sendButton}
              onClick={sendMessage}
              disabled={!newMessage.trim() && !attachment}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          
          {attachment && (
            <div className={styles.attachmentPreview}>
              {attachment.type.startsWith('image/') ? (
                <div className={styles.imagePreview}>
                  <img 
                    src={attachment.url} 
                    alt="Attachment preview" 
                    className={styles.previewImage}
                  />
                  <button 
                    className={styles.removeAttachment}
                    onClick={() => setAttachment(null)}
                  >
                    &times;
                  </button>
                </div>
              ) : attachment.type === 'audio/mp3' ? (
                <div className={styles.voicePreview}>
                  <div className={styles.voiceInfo}>
                    <span>Voice message: {formatDuration(attachment.duration)}</span>
                    <button 
                      className={styles.removeAttachment}
                      onClick={() => setAttachment(null)}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.filePreview}>
                  <div className={styles.fileIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                    </svg>
                  </div>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{attachment.name}</div>
                    <div className={styles.fileSize}>{formatFileSize(attachment.size)}</div>
                  </div>
                  <button 
                    className={styles.removeAttachment}
                    onClick={() => setAttachment(null)}
                  >
                    &times;
                  </button>
                </div>
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