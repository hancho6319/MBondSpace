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
import styles from '../styles/components/NotificationBell.module.css';

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'profiles', currentUser.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.container}>
      <button 
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span role="img" aria-label="Notifications">🔔</span>
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
            <div className={styles.empty}>No notifications</div>
          ) : (
            <ul className={styles.notificationList}>
              {notifications.map(notification => (
                <li 
                  key={notification.id}
                  className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <img 
                    src={notification.fromUserPhoto || '/default-avatar.png'} 
                    alt={notification.fromUserName} 
                    className={styles.notificationAvatar}
                  />
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <strong>{notification.fromUserName}</strong>
                      <span className={styles.notificationTime}>
                        {new Date(notification.createdAt?.toDate()).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    {notification.type === 'group_invitation' && (
                      <div className={styles.notificationActions}>
                        <button className={styles.acceptButton}>Seen</button>
                        <button className={styles.declineButton}>Ignore</button>
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