import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { subscribeToGroupEvents } from '../services/events';

const localizer = momentLocalizer(moment);

export default function EventCalendar({ groupId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!groupId) return;
    
    const unsubscribe = subscribeToGroupEvents(groupId, (events) => {
      const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.date + 'T' + event.startTime),
        end: new Date(event.date + 'T' + event.endTime),
        allDay: false,
        description: event.description,
        location: event.location,
        attendees: event.attendees || []
      }));
      setEvents(formattedEvents);
    });
    
    return unsubscribe;
  }, [groupId]);

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={(event) => alert(`Selected: ${event.title}`)}
      />
    </div>
  );
}