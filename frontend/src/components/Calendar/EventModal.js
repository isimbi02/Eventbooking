import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  FileText
} from 'lucide-react';

const EventModal = ({ event, onClose, onBookEvent, isBooking, user, isBooked, isFull }) => {
  const handleBook = () => {
    onBookEvent(event.id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const { date, time } = formatDate(event.date);

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
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="header-content">
              <h2>{event.title}</h2>
              {isBooked && (
                <div className="booking-badge">
                  <CheckCircle size={14} />
                  <span>Already Booked</span>
                </div>
              )}
              {isFull && !isBooked && (
                <div className="booking-badge full-badge">
                  <AlertCircle size={14} />
                  <span>Event Full</span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="close-btn" aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Event Details */}
            <div className="event-details">
              <div className="detail-item">
                <Calendar size={18} />
                <div>
                  <div className="detail-label">Date</div>
                  <div className="detail-value">{date}</div>
                </div>
              </div>
              
              <div className="detail-item">
                <Clock size={18} />
                <div>
                  <div className="detail-label">Time</div>
                  <div className="detail-value">{time}</div>
                </div>
              </div>
              
              <div className="detail-item">
                <MapPin size={18} />
                <div>
                  <div className="detail-label">Location</div>
                  <div className="detail-value">{event.location}</div>
                </div>
              </div>
              
              <div className="detail-item">
                <Users size={18} />
                <div>
                  <div className="detail-label">Attendance</div>
                  <div className="detail-value">
                    {event.attendeeCount} / {event.capacity} attendees
                    {isFull && (
                      <span className="capacity-warning"> • Full</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="event-description">
              <h4>
                <FileText size={18} />
                Description
              </h4>
              <p>{event.description}</p>
            </div>

            {/* Organizer */}
            <div className="event-organizer">
              <h4>
                <User size={18} />
                Organizer
              </h4>
              <p>{event.organizer?.name || 'Unknown Organizer'}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            {!user ? (
              <div className="login-prompt">
                Please log in to book events
              </div>
            ) : isBooked ? (
              <button className="btn booked" disabled>
                <CheckCircle size={16} />
                Already Booked
              </button>
            ) : isFull ? (
              <button className="btn full" disabled>
                <AlertCircle size={16} />
                Event Full
              </button>
            ) : (
              <button 
                className="btn primary" 
                onClick={handleBook}
                disabled={isBooking}
              >
                {isBooking ? (
                  <>
                    <span className="loading-spinner"></span>
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Book Event
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(EventModal);