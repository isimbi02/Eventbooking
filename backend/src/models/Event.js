const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Event = {
  // Find all events with filtering
  async findMany(filters = {}) {
    const { category, location, startDate, endDate, search } = filters;
    
    let where = {};
    
    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    return await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        bookings: {
          where: {
            status: 'CONFIRMED'
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  },

  // Find event by ID
  async findById(id) {
    return await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        bookings: {
          where: {
            status: 'CONFIRMED'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  },

  // Create new event
  async create(eventData) {
    return await prisma.event.create({
      data: eventData,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  },

  // Update event
  async update(id, eventData) {
    return await prisma.event.update({
      where: { id: parseInt(id) },
      data: eventData,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  },

  // Count attendees for an event
  async countAttendees(eventId) {
    return await prisma.booking.count({
      where: {
        eventId: parseInt(eventId),
        status: 'CONFIRMED'
      }
    });
  }
};

module.exports = Event;