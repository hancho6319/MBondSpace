import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { getProfile } from '../services/profileService';
import styles from '../styles/components/NotificationBell.module.css';

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState({});

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'profiles', currentUser.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let fromUserProfile = null;
        
        try {
          setLoadingProfiles(prev => ({ ...prev, [data.fromUserId]: true }));
          fromUserProfile = await getProfile(data.fromUserId);
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoadingProfiles(prev => ({ ...prev, [data.fromUserId]: false }));
        }

        return {
          id: doc.id,
          ...data,
          fromUserProfile
        };
      });

      Promise.all(notificationPromises).then(notifs => {
        setNotifications(notifs);
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(
        doc(db, 'profiles', currentUser.uid, 'notifications', notificationId),
        { read: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAction = async (notificationId, action) => {
    try {
      await updateDoc(
        doc(db, 'profiles', currentUser.uid, 'notifications', notificationId),
        { status: action }
      );
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.container}>
      <button 
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg className={styles.bellIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className={styles.markAllRead}
                onClick={() => notifications.forEach(n => markAsRead(n.id))}
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className={styles.empty}>No notifications yet</div>
          ) : (
            <ul className={styles.notificationList}>
              {notifications.map(notification => (
                <li 
                  key={notification.id}
                  className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      {notification.fromUserProfile ? (
                        <div className={styles.userInfo}>
                          <img 
                            src={notification.fromUserProfile.photoURL || '/default-avatar.png'} 
                            alt={notification.fromUserProfile.name} 
                            className={styles.userAvatar}
                          />
                          <strong>{notification.fromUserProfile.name}</strong>
                        </div>
                      ) : (
                        <div className={styles.userInfo}>
                          <div className={styles.avatarPlaceholder} />
                          {loadingProfiles[notification.fromUserId] ? (
                            <span>Loading...</span>
                          ) : (
                            <strong>{notification.fromUserName || 'Unknown user'}</strong>
                          )}
                        </div>
                      )}
                      <span className={styles.notificationTime}>
                        {new Date(notification.createdAt?.toDate()).toLocaleString()}
                      </span>
                    </div>
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    {notification.type === 'group_invitation' && (
                      <div className={styles.notificationActions}>
                        <button 
                          className={styles.seenButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(notification.id, 'seen');
                          }}
                        >
                          Seen
                        </button>
                        <button 
                          className={styles.ignoreButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(notification.id, 'ignored');
                          }}
                        >
                          Ignore
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}