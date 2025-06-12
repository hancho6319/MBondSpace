import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupContext';
import { searchUsers } from '../services/groupService';
import UserAvatar from './UserAvatar';
import styles from '../styles/components/GroupHeader.module.css';

export default function GroupHeader({ group }) {
  const { currentUser } = useAuth();
  const { addMember, removeMember } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const isAdmin = group.admin === currentUser.uid;

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(term);
      // Filter out existing members
      const filteredResults = results.filter(user => 
        !group.members.includes(user.id) && user.id !== currentUser.uid
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await addMember(group.id, userId);
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (userId === group.admin) {
      alert('Cannot remove group admin');
      return;
    }
    
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(group.id, userId);
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className={styles.groupHeader}>
      <div className={styles.groupInfo}>
        <div className={styles.avatarContainer}>
          {group.photoURL ? (
            <img 
              src={group.photoURL} 
              alt={group.name} 
              className={styles.groupAvatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {group.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className={styles.groupName}>{group.name}</h2>
          <p className={styles.groupDescription}>{group.description}</p>
        </div>
      </div>

      <div className={styles.groupActions}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users to add..."
            className={styles.searchInput}
          />
          
          {searchTerm && (
            <div className={styles.searchResults}>
              {isSearching ? (
                <div className={styles.loading}>Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className={styles.noResults}>No users found</div>
              ) : (
                searchResults.map(user => (
                  <div 
                    key={user.id} 
                    className={styles.searchResultItem}
                    onClick={() => handleAddMember(user.id)}
                  >
                    <UserAvatar user={user} size="small" />
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.name || user.email}</span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button 
          className={styles.membersButton}
          onClick={() => setShowMembers(!showMembers)}
        >
          {group.members.length} Members
        </button>
      </div>

      {showMembers && (
        <div className={styles.membersModal}>
          <div className={styles.modalHeader}>
            <h3>Group Members</h3>
            <button 
              onClick={() => setShowMembers(false)}
              className={styles.closeModal}
            >
              &times;
            </button>
          </div>
          <div className={styles.membersList}>
            {group.members.map(memberId => {
              // In a real app, you'd fetch user data for each member
              const isCurrentUser = memberId === currentUser.uid;
              const isGroupAdmin = memberId === group.admin;
              
              return (
                <div key={memberId} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    <UserAvatar userId={memberId} size="medium" />
                    <div>
                      <div className={styles.memberName}>
                        {isCurrentUser ? 'You' : `User ${memberId.substring(0, 6)}`}
                        {isGroupAdmin && <span className={styles.adminBadge}>Admin</span>}
                      </div>
                      <div className={styles.memberEmail}>{memberId}@example.com</div>
                    </div>
                  </div>
                  
                  {isAdmin && !isGroupAdmin && (
                    <button 
                      className={styles.removeButton}
                      onClick={() => handleRemoveMember(memberId)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}