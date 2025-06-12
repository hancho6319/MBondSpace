import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from '../services/firebase';
import { setDoc, doc } from 'firebase/firestore';
import styles from './Auth.module.css';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          email,
          createdAt: new Date(),
          role: 'member',
          keywords: [email.toLowerCase(), email.split('@')[0].toLowerCase()]
        });
      }
      navigate('/profile');
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Password reset email sent! Check your inbox.');
      setShowReset(false);
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch(code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'Account disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email already in use';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later';
      default:
        return 'An error occurred. Please try again';
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {showReset ? (
          <div className={styles.resetForm}>
            <h2 className={styles.authTitle}>Reset Password</h2>
            <p className={styles.authSubtitle}>
              Enter your email and we'll send you a link to reset your password
            </p>
            
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <form className={styles.authForm}>
              <div className={styles.formGroup}>
                <label htmlFor="resetEmail" className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>
              
              <button
                type="button"
                onClick={handleReset}
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className={styles.secondaryButton}
              >
                Back to {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>
          </div>
        ) : (
          <>
            <h2 className={styles.authTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className={styles.authSubtitle}>
              {isLogin ? 'Sign in to continue' : 'Join our community today'}
            </p>
            
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <form onSubmit={handleAuth} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.formInput}
                  required
                  minLength={6}
                />
              </div>
              
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </button>
              
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className={styles.textButton}
                >
                  Forgot Password?
                </button>
              )}
            </form>
            
            <div className={styles.authToggle}>
              <span>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className={styles.toggleButton}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
            
            <div className={styles.socialAuth}>
              <p className={styles.socialDivider}>or continue with</p>
              <div className={styles.socialButtons}>
                <button type="button" className={styles.socialButton}>
                  <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                    <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.153-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.61-0.056-1.216-0.158-1.808h-9.842z" />
                  </svg>
                  Google
                </button>
                <button type="button" className={styles.socialButton}>
                  <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}