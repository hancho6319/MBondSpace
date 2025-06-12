export default function UserAvatar({ user, userId, size = 'medium' }) {
  const displayUser = user || { id: userId };
  
  const getInitials = () => {
    if (displayUser.name) {
      return displayUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (displayUser.email) {
      return displayUser.email[0].toUpperCase();
    }
    return 'U';
  };

  const sizeStyles = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 48, height: 48, fontSize: 16 },
    large: { width: 64, height: 64, fontSize: 20 }
  };

  return (
    <div style={{
      borderRadius: '50%',
      backgroundColor: '#e5e7eb',
      color: '#4b5563',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...sizeStyles[size]
    }}>
      {displayUser.photoURL ? (
        <img 
          src={displayUser.photoURL} 
          alt={displayUser.name || 'User avatar'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div>{getInitials()}</div>
      )}
    </div>
  );
}