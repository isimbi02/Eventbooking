import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, Clock } from 'lucide-react';
import './Calendar.css';

const EventModal = ({ event, onClose, onBookEvent, isBooking, user }) => {
  const handleBook = () => {
    onBookEvent(event.id);
  };

  const isBooked = event.isBooked || event.attendees?.some(attendee => attendee.id === user?.id);
  const isFull = event.attendeeCount >= event.capacity;
//   const canBook = !isBooked && !isFull && user;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>{event.title}</h2>
            <button onClick={onClose} className="close-btn">
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <div className="event-details">
              <div className="detail-item">
                <Calendar size={18} />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <Clock size={18} />
                <span>{new Date(event.date).toLocaleTimeString()}</span>
              </div>
              <div className="detail-item">
                <MapPin size={18} />
                <span>{event.location}</span>
              </div>
              <div className="detail-item">
                <Users size={18} />
                <span>{event.attendeeCount} / {event.capacity} attendees</span>
              </div>
            </div>

            <div className="event-description">
              <h4>Description</h4>
              <p>{event.description}</p>
            </div>

            <div className="event-organizer">
              <h4>Organizer</h4>
              <p>{event.organizer?.name}</p>
            </div>
          </div>

          <div className="modal-footer">
            {!user ? (
              <p className="login-prompt">Please log in to book this event</p>
            ) : isBooked ? (
              <button className="btn booked" disabled>
                Already Booked
              </button>
            ) : isFull ? (
              <button className="btn full" disabled>
                Event Full
              </button>
            ) : (
              <button 
                className="btn primary" 
                onClick={handleBook}
                disabled={isBooking}
              >
                {isBooking ? 'Booking...' : 'Book Event'}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(EventModal);