import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../services/firebase';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    photoURL: '',
  });
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let photoURL = profile.photoURL;
      
      if (photoFile) {
        const storageRef = ref(storage, `profilePhotos/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: profile.name,
        bio: profile.bio,
        photoURL,
      });
      
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="profile-photo">
          {profile.photoURL && (
            <img src={profile.photoURL} alt="Profile" className="profile-image" />
          )}
          <input type="file" onChange={handleFileChange} accept="image/*" />
        </div>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Bio:</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            rows="4"
          />
        </div>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}

export default Profile;