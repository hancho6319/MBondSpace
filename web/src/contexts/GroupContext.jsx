import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getGroups, 
  createGroup as createGroupService, 
  deleteGroup as deleteGroupService 
} from '../services/groupService';

const GroupContext = createContext();

export function GroupProvider({ children }) {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser?.uid) {
        setGroups([]);
        return;
      }

      const groupsData = await getGroups(currentUser.uid);
      setGroups(groupsData);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError(err.message || 'Failed to load groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  const createGroup = async (groupData) => {
    try {
      const newGroup = await createGroupService(groupData);
      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (err) {
      console.error('Error creating group:', err);
      throw err;
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await deleteGroupService(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (err) {
      console.error('Error deleting group:', err);
      throw err;
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        error,
        refreshGroups,
        createGroup,
        deleteGroup
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupContext);
}