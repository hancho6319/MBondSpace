import React, { useState } from 'react';
import styles from './Auth.module.css';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from './services/firebase';
import { doc, setDoc, getFirestore } from "firebase/firestore";

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Password validation
    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign up new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user profile in Firestore
        const db = getFirestore();
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          displayName: email.split('@')[0], // Default username
          createdAt: new Date(),
          photoURL: null,
          bio: ''
        });
      }
      navigate('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Password reset email sent! Check your inbox.');
      setShowReset(false);
      setResetEmail('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {showReset ? (
        <div className="reset-password">
          <h2>Reset Password</h2>
          {error && <div className="error-message">{error}</div>}
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
          />
          <button onClick={handleReset} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
          <button onClick={() => {
            setShowReset(false);
            setError(null);
          }} disabled={loading}>
            Cancel
          </button>
        </div>
      ) : (
        <form onSubmit={handleAuth}>
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          {error && <div className="error-message">{error}</div>}
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={loading}
            minLength={isLogin ? undefined : 6}
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            disabled={loading}
          >
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
          
          {isLogin && (
            <button 
              type="button" 
              onClick={() => {
                setShowReset(true);
                setError(null);
              }}
              disabled={loading}
            >
              Forgot Password?
            </button>
          )}
        </form>
      )}
    </div>
  );
}

export default Auth;