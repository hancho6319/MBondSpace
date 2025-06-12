import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupContext';
import styles from '../styles/components/GroupForm.module.css';

export default function GroupForm({ onClose }) {
  const { currentUser } = useAuth();
  const { createGroup } = useGroups();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newGroup = {
        name: name.trim(),
        description: description.trim(),
        admin: currentUser.uid,
        members: [currentUser.uid],
        createdAt: new Date(),
        photoURL: currentUser.photoURL || ''
      };

      await createGroup(newGroup);
      
      // Clear form
      setName('');
      setDescription('');
      
      if (onClose) onClose();
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.groupForm}>
      <div className={styles.formHeader}>
        <h3>Create New Group</h3>
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close form"
          >
            &times;
          </button>
        )}
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="group-name">
          Group Name *
        </label>
        <input
          type="text"
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name"
          required
          maxLength={50}
        />
        <span className={styles.charCount}>{name.length}/50</span>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="group-description">
          Description
        </label>
        <textarea
          id="group-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this group about?"
          rows={3}
          maxLength={200}
        />
        <span className={styles.charCount}>{description.length}/200</span>
      </div>

      <div className={styles.formActions}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || !name.trim()}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner}></span>
              Creating...
            </>
          ) : (
            'Create Group'
          )}
        </button>
      </div>
    </form>
  );
}