import { createContext, useContext, useState, useEffect } from "react";
import {
  getGroups,
  createGroup,
  deleteGroup,
  addMember,
  removeMember,
} from "../services/groupService";

const GroupContext = createContext();

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshGroups = async () => {
    try {
      setLoading(true);
      console.log("Attempting to load groups...");
      const groupsData = await getGroups();
      console.log("Groups data received:", groupsData);
      setGroups(groupsData);
      setError(null);
    } catch (err) {
      console.error("Detailed group load error:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      setError(`Failed to load groups: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const newGroup = await createGroup(groupData);
      setGroups((prev) => [...prev, newGroup]);
      return newGroup;
    } catch (err) {
      setError("Failed to create group");
      throw err;
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (err) {
      setError("Failed to delete group");
      throw err;
    }
  };

  const handleAddMember = async (groupId, userId) => {
    try {
      await addMember(groupId, userId);
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, members: [...group.members, userId] }
            : group
        )
      );
    } catch (err) {
      setError("Failed to add member");
      throw err;
    }
  };

  const handleRemoveMember = async (groupId, userId) => {
    try {
      await removeMember(groupId, userId);
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? { ...group, members: group.members.filter((m) => m !== userId) }
            : group
        )
      );
    } catch (err) {
      setError("Failed to remove member");
      throw err;
    }
  };

  useEffect(() => {
    refreshGroups();
  }, []);

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        error,
        refreshGroups,
        createGroup: handleCreateGroup,
        deleteGroup: handleDeleteGroup,
        addMember: handleAddMember,
        removeMember: handleRemoveMember,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupContext);
}
