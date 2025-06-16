import { useState, useEffect, useCallback } from 'react';
import { 
  query, 
  collection, 
  where, 
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/components/GroupUserSearch.module.css';

export default function GroupUserSearch({ 
  groupId, 
  existingMembers = [],
  onAddMember 
}) {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const searchUsers = useCallback(async (term) => {
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'profiles'),
        where('searchKeywords', 'array-contains', term.toLowerCase())
      );
      
      const snapshot = await getDocs(q);
      const filteredResults = snapshot.docs
        .map(doc => ({ 
          id: doc.id, 
          name: doc.data().name || 'User',
          email: doc.data().email || '',
          photoURL: doc.data().photoURL || ''
        }))
        .filter(user => 
          !existingMembers.includes(user.id) && 
          user.id !== currentUser?.uid
        );
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setNotification({ 
        message: 'Error searching users', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, existingMembers]);

  const handleAddMember = async (user) => {
    if (!currentUser || !groupId) return;

    try {
      setLoading(true);
      setNotification({ message: '', type: '' });
      
      await updateDoc(doc(db, 'groups', groupId), {
        members: arrayUnion(user.id),
        updatedAt: serverTimestamp()
      });

      const notificationRef = doc(
        collection(db, 'profiles', user.id, 'notifications'),
        Date.now().toString()
      );

      await setDoc(notificationRef, {
        type: 'group_invitation',
        groupId,
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || 'Group Admin',
        fromUserPhoto: currentUser.photoURL || '',
        timestamp: serverTimestamp(),
        read: false,
        message: `You've been added to a group by ${currentUser.displayName || 'a user'}`
      });

      setNotification({ 
        message: `Added ${user.name} to group`,
        type: 'success'
      });
      
      setSearchTerm('');
      setResults([]);
      onAddMember?.(user.id);
      
      setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error adding member:', error);
      setNotification({ 
        message: 'Failed to add user',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchUsers]);

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isMobile ? "Search users..." : "Search users to add to group..."}
          className={styles.searchInput}
          disabled={loading}
        />
        {loading && <div className={styles.spinner}></div>}
      </div>

      {notification.message && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {results.length > 0 && (
        <div className={styles.resultsContainer}>
          <ul className={styles.resultsList}>
            {results.map(user => (
              <li key={user.id} className={styles.resultItem}>
                <div className={styles.userInfo}>
                  <img 
                    src={user.photoURL || '/default-avatar.png'} 
                    alt={user.name} 
                    className={styles.userAvatar}
                    loading="lazy"
                  />
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>
                      {user.name}
                    </div>
                    {!isMobile && user.email && (
                      <div className={styles.userEmail}>{user.email}</div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleAddMember(user)}
                  className={styles.addButton}
                  disabled={loading}
                  aria-label={`Add ${user.name} to group`}
                >
                  {loading ? (
                    <span className={styles.buttonSpinner}></span>
                  ) : (
                    isMobile ? '+' : 'Add to Group'
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}