import { Link } from 'react-router-dom';
import styles from '../styles/components/GroupCard.module.css';

export default function GroupCard({ group, currentUserId, onDelete }) {
  const isAdmin = group.admin === currentUserId;

  return (
    <div className={styles.card}>
      <Link to={`/chat/${group.id}`} className={styles.cardLink}>
        <div className={styles.cardHeader}>
          {group.photoURL ? (
            <img src={group.photoURL} alt={group.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {group.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={styles.groupInfo}>
            <h3 className={styles.groupName}>{group.name}</h3>
            <p className={styles.groupDescription}>
              {group.description || 'No description'}
            </p>
          </div>
        </div>
      </Link>

      <div className={styles.cardFooter}>
        <div className={styles.metaInfo}>
          <span className={styles.memberCount}>
            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
          </span>
          <span className={styles.adminBadge}>
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>
        {isAdmin && (
          <button 
            className={styles.deleteButton}
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm('Delete this group permanently?')) {
                onDelete(group.id);
              }
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}