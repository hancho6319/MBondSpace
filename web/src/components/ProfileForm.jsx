import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile } from "../services/profileService";
import styles from '../styles/components/ProfileForm.module.css';

export default function ProfileForm() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    photoURL: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.uid) {
        try {
          const profileData = await getProfile(currentUser.uid);
          if (profileData) {
            setProfile(profileData);
          }
        } catch (err) {
          setError("Failed to load profile");
          console.error(err);
        }
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError("");

      await updateProfile(currentUser.uid, profile, photoFile);
      // Show success message
      setError("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.profileForm}>
      {error && (
        <div
          className={`${styles.alert} ${
            error.includes("success") ? styles.successAlert : styles.errorAlert
          }`}
        >
          {error}
        </div>
      )}

      <div className={styles.photoContainer}>
        {profile.photoURL && (
          <img
            src={profile.photoURL}
            alt="Profile"
            className={styles.photoPreview}
          />
        )}
        <input
          type="file"
          id="profilePhoto"
          onChange={(e) => setPhotoFile(e.target.files[0])}
          accept="image/*"
          className={styles.photoInput}
          disabled={loading}
        />
        <label htmlFor="profilePhoto" className={styles.photoLabel}>
          {profile.photoURL ? "Change Photo" : "Upload Photo"}
        </label>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className={styles.inputField}
          disabled={loading}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className={`${styles.inputField} ${styles.textareaField}`}
          disabled={loading}
        />
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading && <span className={styles.spinner}></span>}
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
