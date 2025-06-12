import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  collection,
  orderBy,
  db,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp
} from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import EventCalendar from '../components/EventCalendar';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';
import styles from './Events.module.css';

export default function Events() {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showForm, setShowForm] = useState(false);

  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    if (!groupId) return;
    
    let q;
    if (activeTab === 'upcoming') {
      q = query(
        collection(db, 'groups', groupId, 'events'),
        where('date', '>=', new Date().toISOString().split('T')[0]),
        orderBy('date')
      );
    } else {
      q = query(
        collection(db, 'groups', groupId, 'events'),
        where('date', '<', new Date().toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    });
    
    return () => unsubscribe();
  }, [groupId, activeTab]);

  const createEvent = async (eventData) => {
    try {
      await addDoc(collection(db, 'groups', groupId, 'events'), {
        ...eventData,
        creator: currentUser.uid,
        creatorName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        attendees: [currentUser.uid]
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className={styles.eventsPage}>
      <div className={styles.pageHeader}>
        <h1>Group Events</h1>
        <div className={styles.headerActions}>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className={styles.createButton}
          >
            {showForm ? 'Cancel' : 'Create Event'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className={styles.eventFormContainer}>
          <EventForm onSubmit={createEvent} />
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Events
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'past' ? styles.active : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Events
        </button>
      </div>

      <div className={styles.viewToggle}>
        <div className={styles.toggleOptions}>
          <span className={styles.toggleLabel}>View:</span>
          <button 
            className={`${styles.toggleOption} ${styles.calendarView}`}
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </button>
          <button 
            className={`${styles.toggleOption} ${styles.listView}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className={styles.calendarContainer}>
          <EventCalendar 
            groupId={groupId} 
            events={events} 
            onEventClick={(event) => {
              // Handle event click (show details modal, etc.)
              console.log('Event clicked:', event);
            }}
          />
        </div>
      ) : (
        <div className={styles.eventListContainer}>
          {events.length === 0 ? (
            <div className={styles.emptyState}>
              {activeTab === 'upcoming' 
                ? 'No upcoming events scheduled' 
                : 'No past events found'}
            </div>
          ) : (
            <EventList 
              events={events} 
              currentUserId={currentUser?.uid}
              groupId={groupId}
            />
          )}
        </div>
      )}
    </div>
  );
}