import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { bookingsAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import BookingList from './BookingList';
import MiniCalendar from './MiniCalendar';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import './Dashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { user } = useAuth();

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsAPI.getUserBookings().then(res => res.data),
    enabled: !!user,
    staleTime: 30000,
  });

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    const now = new Date();
    return bookings.filter(booking => {
      const eventDate = new Date(booking.event.date);
      return activeTab === 'upcoming' ? eventDate > now : eventDate < now;
    });
  }, [bookings, activeTab]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load bookings" />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="bookings-section">
            <div className="tabs">
              <button
                className={activeTab === 'upcoming' ? 'active' : ''}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Events
              </button>
              <button
                className={activeTab === 'past' ? 'active' : ''}
                onClick={() => setActiveTab('past')}
              >
                Past Events
              </button>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BookingList bookings={filteredBookings} />
            </motion.div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <MiniCalendar bookings={bookings} />
          
          <div className="stats-card">
            <h3>Booking Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{bookings?.length || 0}</span>
                <span className="stat-label">Total Bookings</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {bookings?.filter(b => new Date(b.event.date) > new Date()).length || 0}
                </span>
                <span className="stat-label">Upcoming</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {bookings?.filter(b => new Date(b.event.date) < new Date()).length || 0}
                </span>
                <span className="stat-label">Past</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserDashboard);