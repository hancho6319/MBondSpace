import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const getGoogleAuthToken = async (userId) => {
  try {
    const tokenDoc = await getDoc(doc(db, 'googleTokens', userId));
    return tokenDoc.exists() ? tokenDoc.data().accessToken : null;
  } catch (error) {
    console.error('Error getting Google auth token:', error);
    return null;
  }
};

export const saveGoogleAuthToken = async (userId, token) => {
  try {
    await setDoc(doc(db, 'googleTokens', userId), {
      accessToken: token,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error saving Google auth token:', error);
  }
};

export const createGoogleCalendarEvent = async (userId, eventData) => {
  const token = await getGoogleAuthToken(userId);
  if (!token) throw new Error('Google Calendar not connected');

  const googleEvent = {
    summary: eventData.title,
    description: eventData.description,
    start: {
      dateTime: new Date(`${eventData.date}T${eventData.startTime}`).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: new Date(`${eventData.date}T${eventData.endTime}`).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    location: eventData.location,
    attendees: eventData.attendees?.map(email => ({ email }))
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleEvent)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create Google Calendar event');
  }

  return await response.json();
};