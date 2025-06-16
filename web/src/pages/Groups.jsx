import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupContext';
import GroupCard from '../components/GroupCard';
import GroupForm from '../components/GroupForm';
import Modal from '../components/Modal';
import Button from '../components/Button';
import styles from './Groups.module.css';

export default function Groups() {
  const { currentUser } = useAuth();
  const { groups, loading, error, createGroup, deleteGroup, refreshGroups } = useGroups();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Refresh groups when user changes or on mount
  useEffect(() => {
    if (currentUser?.uid) {
      refreshGroups();
    }
  }, [currentUser, refreshGroups]);

  const handleCreateGroup = async (groupData) => {
    try {
      await createGroup(groupData);
      setShowCreateModal(false);
      await refreshGroups(); // Explicit refresh after creation
    } catch (error) {
      console.error('Group creation error:', error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      await refreshGroups(); // Explicit refresh after deletion
    } catch (error) {
      console.error('Group deletion error:', error);
    }
  };

  if (!currentUser) {
    return <div className={styles.loading}>Please sign in to view groups</div>;
  }

  if (loading && groups.length === 0) {
    return <div className={styles.loading}>Loading groups...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Your Groups</h1>
        <Button onClick={() => setShowCreateModal(true)}>Create New Group</Button>
      </div>

      {groups.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven't joined any groups yet</p>
          <Button onClick={() => setShowCreateModal(true)}>Create Your First Group</Button>
        </div>
      ) : (
        <div className={styles.groupsGrid}>
          {groups.map(group => (
            <GroupCard 
              key={group.id} 
              group={group} 
              onDelete={handleDeleteGroup}
              currentUserId={currentUser.uid}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <GroupForm 
            onSubmit={handleCreateGroup} 
            onClose={() => setShowCreateModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}