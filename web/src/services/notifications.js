import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { doc, updateDoc, orderBy } from 'firebase/firestore';

export const createNotification = async (userId, message, type, link) => {
  await addDoc(collection(db, 'notifications'), {
    userId,
    message,
    type,
    link,
    read: false,
    createdAt: new Date()
  });
};

export const markAsRead = async (notificationId) => {
  await updateDoc(doc(db, 'notifications', notificationId), {
    read: true
  });
};

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notifications);
  });
};