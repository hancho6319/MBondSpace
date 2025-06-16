import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGroups } from "../contexts/GroupContext";
import GroupUserSearch from "./GroupUserSearch";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../services/firebase";
import styles from "../styles/components/GroupHeader.module.css";

export default function GroupHeader({ group, userProfiles = {} }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { refreshGroups } = useGroups();
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (group) {
      setGroupData(group);
      setLoading(false);
    }
  }, [group]);

  const isAdmin = groupData?.admin === currentUser?.uid;

  const getMemberName = (memberId) => {
    if (memberId === currentUser?.uid) return 'You';
    return userProfiles[memberId]?.name || `User ${memberId.substring(0, 6)}`;
  };

  const getMemberPhoto = (memberId) => {
    if (memberId === currentUser?.uid) return currentUser.photoURL || '/default-avatar.png';
    return userProfiles[memberId]?.photoURL || '/default-avatar.png';
  };

  const handleRemoveMember = async (memberId) => {
    if (memberId === groupData.admin) {
      setError("Cannot remove group admin");
      return;
    }

    if (!window.confirm(`Remove ${getMemberName(memberId)} from group?`)) return;

    try {
      setIsRemoving(true);
      setError(null);
      
      const groupRef = doc(db, "groups", groupData.id);
      await updateDoc(groupRef, {
        members: arrayRemove(memberId)
      });

      // Refresh the group data
      await refreshGroups();
      setShowMembers(false);
    } catch (error) {
      console.error("Error removing member:", error);
      setError("Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleBackToGroups = () => {
    navigate("/groups");
  };

  if (loading) {
    return (
      <div className={styles.header}>
        <div className={styles.loading}>Loading group...</div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className={styles.header}>
        <div className={styles.error}>Group not found</div>
      </div>
    );
  }

  return (
    <div className={styles.header}>
      <div className={styles.topBar}>
        <button 
          onClick={handleBackToGroups}
          className={styles.backButton}
          aria-label="Back to groups"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </button>

        <div className={styles.groupInfo}>
          {groupData.photoURL ? (
            <img
              src={groupData.photoURL}
              alt={groupData.name}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {groupData.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={styles.groupText}>
            <h2 className={styles.groupName}>{groupData.name}</h2>
            <p className={styles.groupDescription}>{groupData.description}</p>
          </div>
        </div>

        <button
          className={styles.membersButton}
          onClick={() => setShowMembers(!showMembers)}
          aria-expanded={showMembers}
          aria-label={showMembers ? "Hide members" : "Show members"}
        >
          {groupData.members?.length || 0}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button 
            onClick={() => setError(null)} 
            className={styles.closeError}
            aria-label="Close error"
          >
            &times;
          </button>
        </div>
      )}

      {isAdmin && (
        <div className={styles.searchContainer}>
          <GroupUserSearch
            groupId={groupData.id}
            currentUserId={currentUser?.uid}
            existingMembers={groupData.members}
            onAddMember={refreshGroups}
          />
        </div>
      )}

      {showMembers && (
        <div className={styles.membersModal}>
          <div className={styles.modalHeader}>
            <h3>Group Members</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setShowMembers(false)}
              aria-label="Close members list"
            >
              &times;
            </button>
          </div>
          <ul className={styles.membersList}>
            {groupData.members?.map((memberId) => (
              <li key={memberId} className={styles.memberItem}>
                <div className={styles.memberInfo}>
                  <img 
                    src={getMemberPhoto(memberId)}
                    alt={getMemberName(memberId)} 
                    className={styles.memberAvatar}
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div className={styles.memberDetails}>
                    <span className={styles.memberName}>
                      {getMemberName(memberId)}
                      {memberId === groupData.admin && (
                        <span className={styles.adminBadge}>Admin</span>
                      )}
                    </span>
                    <span className={styles.memberEmail}>
                      {userProfiles[memberId]?.email || ''}
                    </span>
                  </div>
                </div>
                {isAdmin && memberId !== groupData.admin && (
                  <button 
                    className={styles.removeButton}
                    onClick={() => handleRemoveMember(memberId)}
                    disabled={isRemoving}
                    aria-label={`Remove ${getMemberName(memberId)}`}
                  >
                    {isRemoving ? (
                      <span className={styles.removingSpinner}></span>
                    ) : (
                      'Remove'
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}