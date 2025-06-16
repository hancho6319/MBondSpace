import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGroups } from "../contexts/GroupContext";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../services/firebase";
import GroupHeader from "../components/GroupHeader";
import Message from "../components/Message";
import TypingIndicator from "../components/TypingIndicator";
import styles from "./ChatPage.module.css";

export default function ChatPage() {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  // eslint-disable-next-line
  const { groups } = useGroups();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch group data and member profiles
  useEffect(() => {
    const fetchGroupAndProfiles = async () => {
      try {
        if (!groupId) return;
        
        // Fetch group data
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (!groupDoc.exists()) {
          setError("Group not found");
          return;
        }

        const groupData = { id: groupDoc.id, ...groupDoc.data() };
        setGroup(groupData);

        // Fetch member profiles
        const profiles = {};
        const profilePromises = groupData.members.map(async (memberId) => {
          const profileDoc = await getDoc(doc(db, "profiles", memberId));
          if (profileDoc.exists()) {
            profiles[memberId] = profileDoc.data();
          }
        });
        
        await Promise.all(profilePromises);
        setUserProfiles(profiles);
        
      } catch (err) {
        console.error("Error fetching group:", err);
        setError("Failed to load group");
      } finally {
        setLoadingGroup(false);
      }
    };

    fetchGroupAndProfiles();
  }, [groupId]);

  // Enhance messages with user profile data
  const enhanceMessages = useCallback((messages) => {
    return messages.map(message => {
      const senderProfile = userProfiles[message.senderId] || {};
      return {
        ...message,
        senderName: senderProfile.name || 'User',
        senderPhotoURL: senderProfile.photoURL || '/default-avatar.png',
        // Ensure timestamp is properly handled
        timestamp: message.timestamp?.toDate ? message.timestamp.toDate() : 
                 message.timestamp instanceof Date ? message.timestamp : new Date()
      };
    });
  }, [userProfiles]);

  // Fetch messages
  useEffect(() => {
    if (!groupId) return;

    const messagesRef = collection(db, "groups", groupId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(enhanceMessages(messagesData));
        setError("");
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages");
      }
    );

    return () => unsubscribe();
  }, [groupId, enhanceMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = () => {
    if (!currentUser?.uid) return;

    // Update typing indicator
    if (!typingUsers.some(u => u.id === currentUser.uid)) {
      const userProfile = userProfiles[currentUser.uid] || {};
      setTypingUsers(prev => [
        ...prev,
        {
          id: currentUser.uid,
          name: userProfile.name || currentUser.displayName || 'User'
        }
      ]);
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
    if ((!newMessage.trim() && !attachment) || sending || !currentUser?.uid) return;

    try {
      setSending(true);
      setError("");

      const userProfile = userProfiles[currentUser.uid] || {};
      const messageData = {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: userProfile.name || currentUser.displayName || 'User',
        senderPhotoURL: userProfile.photoURL || currentUser.photoURL || '',
        timestamp: serverTimestamp(),
        replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          senderName: replyingTo.senderName,
        } : null,
        attachment: attachment ? {
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
          url: attachment.url
        } : null,
      };

      await addDoc(collection(db, "groups", groupId, "messages"), messageData);

      // Reset form
      setNewMessage("");
      setReplyingTo(null);
      setAttachment(null);
      setTypingUsers(prev => prev.filter(u => u.id !== currentUser.uid));
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    scrollToBottom();
  };

  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachment({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    });
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  if (loadingGroup) {
    return <div className={styles.loading}>Loading group...</div>;
  }

  if (!group) {
    return <div className={styles.error}>Group not found</div>;
  }

  return (
    <div className={styles.chatPage}>
      <GroupHeader group={group} userProfiles={userProfiles} />
      
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.chatContainer}>
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
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
                {replyingTo.text.length > 50 ? "..." : ""}
              </div>
              <button className={styles.cancelReply} onClick={cancelReply}>
                &times;
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className={styles.inputArea}>
            <div className={styles.attachmentButtons}>
              <label className={styles.attachmentButton}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleAttachment}
                  style={{ display: "none" }}
                  disabled={sending}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
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
              disabled={sending}
            />

            <button
              type="submit"
              className={styles.sendButton}
              disabled={(!newMessage.trim() && !attachment) || sending}
            >
              {sending ? (
                <span className={styles.sendingSpinner}></span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
          </form>

          {attachment && (
            <div className={styles.attachmentPreview}>
              {attachment.type.startsWith("image/") ? (
                <div className={styles.imagePreview}>
                  <img
                    src={attachment.url}
                    alt="Attachment preview"
                    className={styles.previewImage}
                  />
                  <button
                    className={styles.removeAttachment}
                    onClick={() => setAttachment(null)}
                    disabled={sending}
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className={styles.filePreview}>
                  <div className={styles.fileIcon}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                    </svg>
                  </div>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{attachment.name}</div>
                    <div className={styles.fileSize}>
                      {formatFileSize(attachment.size)}
                    </div>
                  </div>
                  <button
                    className={styles.removeAttachment}
                    onClick={() => setAttachment(null)}
                    disabled={sending}
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

function formatFileSize(bytes) {
  if (!bytes) return '0 bytes';
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}