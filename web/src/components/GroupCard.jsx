import { Link } from 'react-router-dom';
import { useGroups } from '../contexts/GroupContext';
import UserAvatar from './UserAvatar';
import styles from '../styles/components/GroupCard.module.css';

export default function GroupCard({ group, currentUserId }) {
  const { deleteGroup } = useGroups();
  const isAdmin = group.admin === currentUserId;
  
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(group.id);
      } catch (error) {
        console.error('Failed to delete group:', error);
        alert('Failed to delete group. Please try again.');
      }
    }
  };

  return (
    <Link to={`/chat/${group.id}`} className={styles.groupCard}>
      <div className={styles.cardHeader}>
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
        <div className={styles.groupInfo}>
          <h3 className={styles.groupName}>{group.name}</h3>
          <p className={styles.groupDescription}>{group.description}</p>
        </div>
      </div>
      
      <div className={styles.cardStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{group.members.length}</span>
          <span className={styles.statLabel}>Members</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>24</span>
          <span className={styles.statLabel}>Messages</span>
        </div>
      </div>
      
      <div className={styles.cardActions}>
        <div className={styles.membersPreview}>
          {group.members.slice(0, 3).map((memberId, index) => (
            <div 
              key={index} 
              className={styles.memberAvatar}
              style={{ zIndex: 3 - index, marginLeft: index > 0 ? '-10px' : 0 }}
            >
              <UserAvatar userId={memberId} size="small" />
            </div>
          ))}
          {group.members.length > 3 && (
            <div className={styles.moreMembers}>
              +{group.members.length - 3}
            </div>
          )}
        </div>
        
        {isAdmin && (
          <button 
            className={styles.deleteButton}
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
      </div>
    </Link>
  );
}