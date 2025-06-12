import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupContext';
import GroupCard from '../components/GroupCard';
import GroupForm from '../components/GroupForm';
import Button from '../components/Button';
import Modal from '../components/Modal';
import styles from './Groups.module.css';

export default function Groups() {
  const { currentUser } = useAuth();
  const { groups, loading, error } = useGroups();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className={styles.groupsPage}>
      <div className={styles.pageHeader}>
        <h1>Your Groups</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
        >
          Create New Group
        </Button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
          </div>
          <h2>No groups yet</h2>
          <p>Create your first group to start collaborating</p>
          <Button 
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Group
          </Button>
        </div>
      ) : (
        <div className={styles.groupsGrid}>
          {groups.map(group => (
            <GroupCard 
              key={group.id} 
              group={group} 
              currentUserId={currentUser.uid}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <GroupForm onClose={() => setShowCreateModal(false)} />
        </Modal>
      )}
    </div>
  );
}