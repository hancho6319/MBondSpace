import styles from '../styles/components/Button.module.css';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  type = 'button',
  disabled = false
}) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}