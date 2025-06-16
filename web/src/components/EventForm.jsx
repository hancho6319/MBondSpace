import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createGoogleCalendarEvent } from '../services/googleCalendar';
import styles from './EventForm.module.css';

export default function EventForm({ onSubmit }) {
  // eslint-disable-next-line
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    addToGoogleCalendar: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // First create the group event
      await onSubmit(eventData);

      // Then add to Google Calendar if selected
      if (eventData.addToGoogleCalendar && currentUser) {
        await createGoogleCalendarEvent(currentUser.uid, eventData);
        setSuccess('Event created and added to Google Calendar!');
      } else {
        setSuccess('Event created successfully!');
      }

      // Reset form
      setEventData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        addToGoogleCalendar: false
      });
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.eventForm}>
      <h3 className={styles.formTitle}>Create New Event</h3>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.formGroup}>
        <label className={styles.label}>Title *</label>
        <input
          type="text"
          value={eventData.title}
          onChange={(e) => setEventData({...eventData, title: e.target.value})}
          className={styles.input}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Description</label>
        <textarea
          value={eventData.description}
          onChange={(e) => setEventData({...eventData, description: e.target.value})}
          className={styles.textarea}
          rows={4}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Date *</label>
          <input
            type="date"
            value={eventData.date}
            onChange={(e) => setEventData({...eventData, date: e.target.value})}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Start Time *</label>
          <input
            type="time"
            value={eventData.startTime}
            onChange={(e) => setEventData({...eventData, startTime: e.target.value})}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>End Time *</label>
          <input
            type="time"
            value={eventData.endTime}
            onChange={(e) => setEventData({...eventData, endTime: e.target.value})}
            className={styles.input}
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Location</label>
        <input
          type="text"
          value={eventData.location}
          onChange={(e) => setEventData({...eventData, location: e.target.value})}
          className={styles.input}
          placeholder="Virtual meeting link or physical address"
        />
      </div>

      {currentUser && (
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="googleCalendar"
            checked={eventData.addToGoogleCalendar}
            onChange={(e) => setEventData({...eventData, addToGoogleCalendar: e.target.checked})}
            className={styles.checkbox}
          />
          <label htmlFor="googleCalendar" className={styles.checkboxLabel}>
            Add to Google Calendar
          </label>
        </div>
      )}

      <button type="submit" className={styles.submitButton}>
        Create Event
      </button>
    </form>
  );
}