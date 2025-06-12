import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createEvent } from '../services/events';

export default function EventForm() {
  const { groupId } = useParams();
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent(groupId, eventData);
      setEventData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <h3>Create New Event</h3>
      {error && <p className="error">{error}</p>}
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={eventData.title}
          onChange={(e) => setEventData({...eventData, title: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={eventData.description}
          onChange={(e) => setEventData({...eventData, description: e.target.value})}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={eventData.date}
            onChange={(e) => setEventData({...eventData, date: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Start Time</label>
          <input
            type="time"
            value={eventData.startTime}
            onChange={(e) => setEventData({...eventData, startTime: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>End Time</label>
          <input
            type="time"
            value={eventData.endTime}
            onChange={(e) => setEventData({...eventData, endTime: e.target.value})}
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          value={eventData.location}
          onChange={(e) => setEventData({...eventData, location: e.target.value})}
        />
      </div>
      <button type="submit" className="primary-btn">
        Create Event
      </button>
    </form>
  );
}