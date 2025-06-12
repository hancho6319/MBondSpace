import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import styles from './EventList.module.css';

export default function EventList({ events, currentUserId, groupId }) {
  return (
    <ul className={styles.eventList}>
      {events.map(event => (
        <li key={event.id} className={styles.eventItem}>
          <div className={styles.eventDate}>
            <div className={styles.dateDay}>
              {format(new Date(event.date), 'd')}
            </div>
            <div className={styles.dateMonth}>
              {format(new Date(event.date), 'MMM')}
            </div>
          </div>
          <div className={styles.eventContent}>
            <h3 className={styles.eventTitle}>
              <Link to={`/groups/${groupId}/events/${event.id}`}>
                {event.title}
              </Link>
            </h3>
            <p className={styles.eventTime}>
              {event.startTime} - {event.endTime}
            </p>
            <p className={styles.eventLocation}>
              {event.location || 'No location specified'}
            </p>
            <div className={styles.eventMeta}>
              <span className={styles.eventCreator}>
                Created by: {event.creatorName}
              </span>
              <span className={styles.eventAttendees}>
                {event.attendees?.length || 0} attending
              </span>
            </div>
          </div>
          {event.creator === currentUserId && (
            <div className={styles.eventActions}>
              <button className={styles.editButton}>Edit</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}