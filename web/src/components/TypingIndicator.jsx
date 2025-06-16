import styles from '../styles/components/TypingIndicator.module.css';

export default function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;

  // Filter out users without names
  const validUsers = users.filter(user => user.name);

  if (validUsers.length === 0) return null;

  return (
    <div className={styles.typingIndicator}>
      <div className={styles.dots}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      <div className={styles.text}>
        {validUsers.length > 1 
          ? `${validUsers.length} people are typing...` 
          : `${validUsers[0].name} is typing...`}
      </div>
    </div>
  );
}