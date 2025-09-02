import React from 'react';

const BookingList = ({ bookings }) => {
  if (!bookings || bookings.length === 0) {
    return <div>No bookings found.</div>;
  }

  return (
    <div>
      {bookings.map(booking => (
        <div key={booking.id} style={{ padding: '1rem', border: '1px solid #ddd', marginBottom: '1rem', borderRadius: '4px' }}>
          <h3>{booking.event.title}</h3>
          <p>Date: {new Date(booking.event.date).toLocaleDateString()}</p>
          <p>Location: {booking.event.location}</p>
        </div>
      ))}
    </div>
  );
};

export default BookingList;