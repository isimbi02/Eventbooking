const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events with optional filtering
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [CONFERENCE, WORKSHOP, SEMINAR, NETWORKING, SOCIAL]
 *         description: Filter by category
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, or location
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/', async (req, res) => {
  try {
    const events = await Event.findMany(req.query);
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(parseInt(req.params.id));
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
});

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('category').isIn(['CONFERENCE', 'WORKSHOP', 'SEMINAR', 'NETWORKING', 'SOCIAL']).withMessage('Invalid category'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const event = await Event.create({
      ...req.body,
      organizerId: req.user.id,
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error while creating event' });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   patch:
 *     summary: Update an event (for rescheduling)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [CONFERENCE, WORKSHOP, SEMINAR, NETWORKING, SOCIAL]
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not authorized to update this event
 *       404:
 *         description: Event not found
 */
router.patch('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('category').optional().isIn(['CONFERENCE', 'WORKSHOP', 'SEMINAR', 'NETWORKING', 'SOCIAL']).withMessage('Invalid category'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(parseInt(req.params.id));
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizer.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    const updatedEvent = await Event.update(parseInt(req.params.id), req.body);
    
    // Emit real-time update
    req.app.get('io').emit('event-update', updatedEvent);
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error while updating event' });
  }
});

/**
 * @swagger
 * /api/events/{id}/capacity-test:
 *   get:
 *     summary: Test event capacity calculation
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event capacity test results
 *       404:
 *         description: Event not found
 */
router.get('/:id/capacity-test', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    // Get event through model
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Direct database count
    const directCount = await prisma.booking.count({
      where: {
        eventId: eventId,
        status: 'CONFIRMED'
      }
    });
    
    res.json({
      eventId: event.id,
      eventTitle: event.title,
      eventCapacity: event.capacity,
      modelAttendeeCount: event.attendeeCount,
      directDBCount: directCount,
      matches: event.attendeeCount === directCount,
      isFull: event.attendeeCount >= event.capacity
    });
  } catch (error) {
    console.error('Capacity test error:', error);
    res.status(500).json({ message: 'Server error testing capacity' });
  }
});

module.exports = router;