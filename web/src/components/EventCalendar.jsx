import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../contexts/AuthContext';
import { getGoogleAuthToken } from '../services/googleCalendar';
import styles from './EventCalendar.module.css';

const localizer = momentLocalizer(moment);

export default function EventCalendar({ groupId, events, onEventClick }) {
  const { currentUser } = useAuth();
  const [googleEvents, setGoogleEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGoogleEvents = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const token = await getGoogleAuthToken(currentUser.uid);
        
        if (!token) {
          setError('Google Calendar not connected');
          return;
        }

        // Fetch events from Google Calendar
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
          `timeMin=${new Date().toISOString()}&` +
          `maxResults=20&` +
          `orderBy=startTime&` +
          `singleEvents=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch Google Calendar events');
        
        const data = await response.json();
        const formattedEvents = data.items.map(event => ({
          id: event.id,
          title: event.summary,
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
          allDay: !event.start.dateTime,
          description: event.description,
          location: event.location,
          googleEvent: true
        }));

        setGoogleEvents(formattedEvents);
      } catch (err) {
        console.error('Error loading Google Calendar events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGoogleEvents();
  }, [currentUser]);

  // Combine group events with Google Calendar events
  const allEvents = [
    ...events.map(event => ({
      ...event,
      start: new Date(event.date + 'T' + event.startTime),
      end: new Date(event.date + 'T' + event.endTime),
      allDay: false,
      googleEvent: false
    })),
    ...googleEvents
  ];

  const eventStyleGetter = (event) => {
    const backgroundColor = event.googleEvent ? '#4285F4' : '#0B8043';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className={styles.calendarContainer}>
      {error && <div className={styles.error}>{error}</div>}
      {loading && <div className={styles.loading}>Loading calendar...</div>}
      
      <Calendar
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={onEventClick}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
      />
      
      <div className={styles.googleAuthContainer}>
        <button 
          onClick={() => window.open('/auth/google', '_blank')}
          className={styles.googleAuthButton}
        >
          Connect Google Calendar
        </button>
      </div>
    </div>
  );
}