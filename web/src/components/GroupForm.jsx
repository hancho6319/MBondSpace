import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/components/GroupForm.module.css';

export default function GroupForm({ onSubmit, onClose }) {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    if (!currentUser?.uid) {
      setError('You must be logged in to create a group');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        admin: currentUser.uid,
        members: [currentUser.uid],
        createdAt: new Date()
      });
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2>Create New Group</h2>
        <button type="button" onClick={onClose} className={styles.closeButton}>
          &times;
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="name">Group Name *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name"
          required
          maxLength={50}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this group about?"
          rows={3}
          maxLength={200}
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </form>
  );
}