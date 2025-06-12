import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  isLogin,
  error,
  onAuth,
  toggleAuth,
  showReset
}) {
  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={onAuth}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="primary-btn">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <div className="auth-options">
        <button type="button" onClick={toggleAuth} className="text-btn">
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
        {isLogin && (
          <button type="button" onClick={showReset} className="text-btn">
            Forgot Password?
          </button>
        )}
      </div>
    </div>
  );
}