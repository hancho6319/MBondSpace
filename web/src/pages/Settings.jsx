import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, db } from '../services/firebase';
import styles from './Settings.module.css';

export default function Settings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    emailUpdates: true
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().settings) {
          setSettings(docSnap.data().settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) fetchSettings();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        settings
      });
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Apply theme immediately
      if (settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading settings...</div>;

  return (
    <div className={styles.settingsPage}>
      <h1 className={styles.pageTitle}>Account Settings</h1>
      
      {success && (
        <div className={styles.successMessage}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.settingsForm}>
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Appearance</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="theme" className={styles.formLabel}>
              Theme
            </label>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleChange}
              className={styles.formSelect}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>
        
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.switchLabel}>
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                className={styles.switchInput}
              />
              <span className={styles.switchSlider}></span>
              <span className={styles.switchText}>Enable notifications</span>
            </label>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.switchLabel}>
              <input
                type="checkbox"
                name="emailUpdates"
                checked={settings.emailUpdates}
                onChange={handleChange}
                className={styles.switchInput}
              />
              <span className={styles.switchSlider}></span>
              <span className={styles.switchText}>Email updates</span>
            </label>
          </div>
        </div>
        
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Account</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={currentUser.email}
              readOnly
              className={styles.formInput}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}