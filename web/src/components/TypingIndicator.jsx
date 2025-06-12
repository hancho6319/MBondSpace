import styles from '../styles/components/TypingIndicator.module.css';

export default function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;

  return (
    <div className={styles.typingIndicator}>
      <div className={styles.dots}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      <div className={styles.text}>
        {users.length > 1 
          ? `${users.length} people are typing...` 
          : `${users[0].name} is typing...`}
      </div>
    </div>
  );
}