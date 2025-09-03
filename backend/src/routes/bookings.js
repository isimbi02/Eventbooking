const express = require('express');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Book an event
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId]
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: ID of the event to book
 *                 example: 1
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 eventId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 bookingDate:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Already booked or event full
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Event not found
 */
router.post('/', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    
    // Check if event exists
    const event = await Event.findById(parseInt(eventId));
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user already booked this event
    const existingBooking = await Booking.findByEventAndUser(
      parseInt(eventId), 
      req.user.id
    );
    
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this event' });
    }
    
    // Check if event has available capacity - USE event.attendeeCount
    if (event.attendeeCount >= event.capacity) {
      return res.status(400).json({ 
        message: `Event is fully booked. ${event.attendeeCount}/${event.capacity} spots taken.` 
      });
    }
    
    // Create booking
    const booking = await Booking.create({
      eventId: parseInt(eventId),
      userId: req.user.id,
    });
    
    // Emit real-time update
    req.app.get('io').emit('booking-update', booking);
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
});

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CONFIRMED, CANCELLED, PENDING]
 *         description: Filter by booking status
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filter upcoming vs past events
 *     responses:
 *       200:
 *         description: List of user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   eventId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   bookingDate:
 *                     type: string
 *                     format: date-time
 *                   event:
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.findByUser(req.user.id, req.query);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

module.exports = router;