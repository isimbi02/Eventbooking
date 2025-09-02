import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { eventsAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import EventModal from './EventModal';
import FilterBar from './FilterBar';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import { toast } from 'react-toastify';
import './Calendar.css';

const localizer = momentLocalizer(moment);

const EventCalendar = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsAPI.getAll(filters).then(res => res.data),
    keepPreviousData: true,
    staleTime: 30000,
  });

  const bookEventMutation = useMutation({
    mutationFn: (eventId) => eventsAPI.bookEvent(eventId),
    onMutate: async (eventId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['events', filters] });
      
      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(['events', filters]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['events', filters], (old) => {
        return old.map(event => 
          event.id === eventId 
            ? { ...event, isBooked: true, attendeeCount: event.attendeeCount + 1 }
            : event
        );
      });
      
      return { previousEvents };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['events', filters], context.previousEvents);
      toast.error(err.response?.data?.message || 'Failed to book event');
    },
    onSettled: () => {
      // Refetch to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ['events', filters] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onSuccess: () => {
      toast.success('Event booked successfully!');
    }
  });

  const calendarEvents = useMemo(() => {
    if (!events) return [];
    
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.date),
      end: new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000),
      allDay: false,
      resource: event
    }));
  }, [events]);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event.resource);
    setShowModal(true);
  }, []);

  const handleBookEvent = useCallback((eventId) => {
    bookEventMutation.mutate(eventId);
  }, [bookEventMutation]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedEvent(null);
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load events" />;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Event Calendar</h1>
        <FilterBar filters={filters} onFilterChange={setFilters} />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="calendar-content"
      >
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '70vh' }}
          onSelectEvent={handleSelectEvent}
          popup
          selectable
          views={['month', 'week', 'day', 'agenda']}
          tooltipAccessor={null}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.resource.isBooked ? '#4caf50' : '#1976d2',
              borderRadius: '4px',
              border: 'none',
              color: 'white',
            },
          })}
        />
      </motion.div>

      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onBookEvent={handleBookEvent}
          isBooking={bookEventMutation.isLoading}
          user={user}
        />
      )}
    </div>
  );
};

export default React.memo(EventCalendar);