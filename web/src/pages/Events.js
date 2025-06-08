import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

function Events({ groupId }) {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    
    const q = query(
      collection(db, 'groups', groupId, 'events'),
      where('date', '>=', new Date().toISOString().split('T')[0])
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    });
    
    return () => unsubscribe();
  }, [groupId]);

  const handleInputChange = (e) => {
    setNewEvent({
      ...newEvent,
      [e.target.name]: e.target.value,
    });
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'groups', groupId, 'events'), {
        ...newEvent,
        creator: auth.currentUser.uid,
        attendees: [auth.currentUser.uid],
        createdAt: new Date(),
      });
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
      });
      setShowForm(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const rsvpToEvent = async (eventId, attending) => {
    try {
      const eventRef = doc(db, 'groups', groupId, 'events', eventId);
      await updateDoc(eventRef, {
        attendees: arrayUnion(auth.currentUser.uid),
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="events-container">
      <h2>Upcoming Events</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Create New Event'}
      </button>
      
      {showForm && (
        <form onSubmit={createEvent} className="event-form">
          <input
            type="text"
            name="title"
            value={newEvent.title}
            onChange={handleInputChange}
            placeholder="Event title"
            required
          />
          <textarea
            name="description"
            value={newEvent.description}
            onChange={handleInputChange}
            placeholder="Description"
            rows="3"
          />
          <input
            type="date"
            name="date"
            value={newEvent.date}
            onChange={handleInputChange}
            required
          />
          <input
            type="time"
            name="time"
            value={newEvent.time}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Create Event</button>
        </form>
      )}
      
      <div className="event-list">
        {events.map(event => (
          <div key={event.id} className="event-item">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>
              {new Date(event.date).toLocaleDateString()} at {event.time}
            </p>
            <p>Created by: {event.creatorName}</p>
            <p>
              Attendees: {event.attendees ? event.attendees.length : 0}
            </p>
            {event.attendees && !event.attendees.includes(auth.currentUser?.uid) && (
              <button onClick={() => rsvpToEvent(event.id, true)}>
                RSVP
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Events;