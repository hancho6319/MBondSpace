import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

function Navbar({ isAdmin }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/groups">ChatApp</Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/profile">Profile</Link>
        <Link to="/groups">Groups</Link>
        
        {isAdmin && (
          <Link to="/admin">Admin Dashboard</Link>
        )}
      </div>
      
      <div className="navbar-actions">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;