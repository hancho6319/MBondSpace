import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  doc, 
  getDoc, 
  updateDoc
} from 'firebase/firestore';
import ProfileForm from '../components/ProfileForm';
import styles from './Profile.module.css';

export default function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    photoURL: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        const docRef = doc(db, 'profiles', currentUser.uid); // Changed from 'users' to 'profiles'
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({
            name: docSnap.data().name || '',
            bio: docSnap.data().bio || '',
            photoURL: docSnap.data().photoURL || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      let photoURL = profile.photoURL;
      
      // Upload new photo if provided
      if (photoFile) {
        const storageRef = ref(storage, `profile-photos/${currentUser.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      
      // Update profile document
      await updateDoc(doc(db, 'profiles', currentUser.uid), {
        name: profile.name,
        bio: profile.bio,
        photoURL,
        updatedAt: new Date()
      });
      
      setSuccess('Profile updated successfully!');
      setProfile(prev => ({ ...prev, photoURL })); // Update local state with new photo URL
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.name) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <h1 className={styles.pageTitle}>Your Profile</h1>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {success && (
        <div className={styles.successMessage}>
          {success}
        </div>
      )}
      
      <ProfileForm
        profile={profile}
        setProfile={setProfile}
        setPhotoFile={setPhotoFile}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}