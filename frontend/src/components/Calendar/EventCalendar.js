import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { eventsAPI, bookingsAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import EventModal from './EventModal';
import FilterBar from './FilterBar';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import './Calendar.css';

const localizer = momentLocalizer(moment);

const EventCalendar = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch events - including booked ones
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsAPI.getAll(filters).then(res => res.data),
    keepPreviousData: true,
    staleTime: 30000,
  });

  // Fetch user's bookings to check which events are already booked
  const { data: userBookings } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: () => bookingsAPI.getUserBookings().then(res => res.data),
    enabled: !!user,
    staleTime: 30000,
  });

  const bookEventMutation = useMutation({
    mutationFn: (eventId) => eventsAPI.bookEvent(eventId),
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: ['events', filters] });
      await queryClient.cancelQueries({ queryKey: ['user-bookings'] });
      
      const previousEvents = queryClient.getQueryData(['events', filters]);
      const previousBookings = queryClient.getQueryData(['user-bookings']);
      
      // Optimistically update events - FIXED: Use previousEvents instead of events
      queryClient.setQueryData(['events', filters], (oldEvents) => {
        return oldEvents.map(event => 
          event.id === eventId 
            ? { ...event, attendeeCount: event.attendeeCount + 1 }
            : event
        );
      });
      
      // Optimistically add to user bookings - FIXED: Use previousEvents instead of events
      if (previousBookings) {
        queryClient.setQueryData(['user-bookings'], (oldBookings) => {
          const event = previousEvents.find(e => e.id === eventId);
          return [...oldBookings, { 
            id: Date.now(), // temporary ID
            eventId: eventId,
            event: event,
            status: 'CONFIRMED',
            bookingDate: new Date().toISOString()
          }];
        });
      }
      
      return { previousEvents, previousBookings };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['events', filters], context.previousEvents);
      queryClient.setQueryData(['user-bookings'], context.previousBookings);
      toast.error(err.response?.data?.message || 'Failed to book event');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events', filters] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onSuccess: () => {
      toast.success('Event booked successfully!');
    }
  });

  // Check if user has booked an event
  const isEventBookedByUser = useCallback((eventId) => {
    if (!userBookings || !user) return false;
    return userBookings.some(booking => 
      booking.eventId === eventId && booking.status === 'CONFIRMED'
    );
  }, [userBookings, user]);

  // Enhanced calendar navigation
  const navigate = useCallback((action) => {
    switch (action) {
      case 'PREV':
        setCurrentDate(moment(currentDate).subtract(1, 'month').toDate());
        break;
      case 'NEXT':
        setCurrentDate(moment(currentDate).add(1, 'month').toDate());
        break;
      case 'TODAY':
        setCurrentDate(new Date());
        break;
      default:
        break;
    }
  }, [currentDate]);

  const calendarEvents = useMemo(() => {
    if (!events) return [];
    
    return events.map(event => {
      const isBooked = isEventBookedByUser(event.id);
      const isFull = event.attendeeCount >= event.capacity;
      
      return {
        id: event.id,
        title: event.title,
        start: new Date(event.date),
        end: new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000),
        allDay: false,
        resource: {
          ...event,
          isBooked,
          isFull
        }
      };
    });
  }, [events, isEventBookedByUser]);

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

  const handleSearchChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setShowFilters(false);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const focusSearchInput = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load events" />;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title-section">
          <h1>Event Calendar</h1>
          <div className="calendar-navigation">
            <button onClick={() => navigate('PREV')} className="nav-button">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => navigate('TODAY')} className="today-button">
              Today
            </button>
            <button onClick={() => navigate('NEXT')} className="nav-button">
              <ChevronRight size={20} />
            </button>
            <span className="current-month">
              {moment(currentDate).format('MMMM YYYY')}
            </span>
          </div>
        </div>
        
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onClearFilters={clearFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          searchInputRef={searchInputRef}
          onSearchFocus={focusSearchInput}
        />
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
          date={currentDate}
          onNavigate={setCurrentDate}
          style={{ height: '70vh' }}
          onSelectEvent={handleSelectEvent}
          popup
          selectable
          views={['month', 'week', 'day', 'agenda']}
          tooltipAccessor={null}
          eventPropGetter={(event) => {
            let backgroundColor = '#1976d2'; // Default blue
            let border = 'none';
            
            if (event.resource.isBooked) {
              backgroundColor = '#4caf50'; // Green for booked events
            } else if (event.resource.isFull) {
              backgroundColor = '#f44336'; // Red for full events
            }
            
            return {
              style: {
                backgroundColor,
                borderRadius: '4px',
                border,
                color: 'white',
                fontSize: '12px',
                padding: '2px 4px',
                opacity: event.resource.isBooked ? 0.8 : 1,
              },
            };
          }}
          components={{
            toolbar: () => null,
            event: ({ event }) => (
              <div className="custom-event">
                <span>{event.title}</span>
                {event.resource.isBooked && (
                  <CheckCircle size={12} style={{ marginLeft: '4px' }} />
                )}
              </div>
            )
          }}
        />
      </motion.div>

      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onBookEvent={handleBookEvent}
          isBooking={bookEventMutation.isLoading}
          user={user}
          isBooked={selectedEvent.isBooked}
          isFull={selectedEvent.isFull}
        />
      )}
    </div>
  );
};

export default React.memo(EventCalendar);