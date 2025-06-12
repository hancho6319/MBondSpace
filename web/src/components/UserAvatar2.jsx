import styles from '../styles/components/UserAvatar.module.css';

export default function UserAvatar({ user, userId, size = 'medium' }) {
  // If userId is provided instead of user object (for members list)
  const displayUser = user || { id: userId };
  
  // Get initials from name or email
  const getInitials = () => {
    if (displayUser.name) {
      return displayUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (displayUser.email) {
      return displayUser.email[0].toUpperCase();
    }
    return 'U'; // Default if no name/email
  };

  // Size classes
  const sizeClasses = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  };

  return (
    <div className={`${styles.avatar} ${sizeClasses[size]}`}>
      {displayUser.photoURL ? (
        <img 
          src={displayUser.photoURL} 
          alt={displayUser.name || 'User avatar'} 
          className={styles.avatarImage}
        />
      ) : (
        <div className={styles.avatarInitials}>
          {getInitials()}
        </div>
      )}
    </div>
  );
}