import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './MiniCalendar.css';

const MiniCalendar = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Generate calendar days
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null); // Empty days before month starts
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  // Check if a day has bookings
  const hasBooking = (day) => {
    if (!bookings || !day) return false;
    
    const dateStr = new Date(year, month, day).toDateString();
    return bookings.some(booking => 
      new Date(booking.event.date).toDateString() === dateStr
    );
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="mini-calendar">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="nav-button">
          <ChevronLeft size={16} />
        </button>
        
        <div className="calendar-title">
          <h3>{monthNames[month]} {year}</h3>
        </div>
        
        <button onClick={goToNextMonth} className="nav-button">
          <ChevronRight size={16} />
        </button>
      </div>
      
      <button onClick={goToToday} className="today-button">
        Today
      </button>
      
      <div className="calendar-grid">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-header">{day}</div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day ? '' : 'empty'} ${hasBooking(day) ? 'has-booking' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot booking-dot"></div>
          <span>Booked event</span>
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;