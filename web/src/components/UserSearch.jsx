import { useState, useEffect } from "react";
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/components/UserSearch.module.css";

export default function UserSearch() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const searchTermLower = searchTerm.toLowerCase();
        const q = query(
          collection(db, "profiles"),
          where("searchKeywords", "array-contains", searchTermLower)
        );

        const snapshot = await getDocs(q);
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResults(usersData);
      } catch (error) {
        console.error("Search error:", error);
        setNotification({ message: "Error searching users", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSendInvite = async () => {
    if (!selectedUser || !currentUser?.uid || !inviteMessage.trim()) return;

    try {
      const notificationRef = doc(
        collection(db, "profiles", selectedUser.id, "notifications")
      );

      await setDoc(notificationRef, {
        type: "group_invitation",
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || "Anonymous",
        fromUserPhoto: currentUser.photoURL || "",
        message: inviteMessage,
        createdAt: new Date(),
        read: false,
        status: "pending",
      });

      setNotification({
        message: "Invitation sent successfully!",
        type: "success",
      });
      setInviteMessage("");
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    } catch (error) {
      console.error("Error sending invitation:", error);
      setNotification({
        message: "Failed to send invitation",
        type: "error",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <input
          type="text"
          name="userSearch"
          autocomplete="on"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search users..."
          className={styles.searchInput}
        />
        {loading && <div className={styles.spinner}></div>}
      </div>

      {isOpen && searchTerm && (
        <div className={styles.resultsContainer}>
          {results.length === 0 ? (
            <div className={styles.noResults}>
              {loading ? "Searching..." : "No users found"}
            </div>
          ) : (
            <ul className={styles.resultsList}>
              {results.map((user) => (
                <li
                  key={user.id}
                  className={styles.resultItem}
                  onClick={() => setSelectedUser(user)}
                >
                  <img
                    src={user.photoURL || "/default-avatar.png"}
                    alt={user.name}
                    className={styles.userAvatar}
                  />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name}</span>
                    <span className={styles.userBio}>
                      {user.bio?.substring(0, 50)}
                      {user.bio?.length > 50 ? "..." : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedUser && (
        <div className={styles.profileModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>User Profile</h2>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setSelectedUser(null);
                  setInviteMessage("");
                }}
              >
                &times;
              </button>
            </div>

            <div className={styles.profileContent}>
              <img
                src={selectedUser.photoURL || "/default-avatar.png"}
                alt={selectedUser.name}
                className={styles.profileImage}
              />
              <h3>{selectedUser.name}</h3>
              <p className={styles.profileBio}>
                {selectedUser.bio || "No bio available"}
              </p>

              <div className={styles.inviteSection}>
                <h4>Send Group Invitation</h4>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Write a message explaining why you want to join..."
                  className={styles.messageInput}
                />
                <button
                  onClick={handleSendInvite}
                  disabled={!inviteMessage.trim()}
                  className={styles.sendButton}
                >
                  Send Invitation
                </button>
                {notification.message && (
                  <div
                    className={`${styles.notification} ${
                      styles[notification.type]
                    }`}
                  >
                    {notification.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
