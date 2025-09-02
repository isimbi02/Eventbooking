const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Booking = {
  // Create new booking
  async create(bookingData) {
    return await prisma.booking.create({
      data: bookingData,
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  },

  // Find booking by event and user
  async findByEventAndUser(eventId, userId) {
    return await prisma.booking.findUnique({
      where: {
        eventId_userId: {
          eventId: parseInt(eventId),
          userId: parseInt(userId)
        }
      }
    });
  },

  // Find user bookings
  async findByUser(userId, filters = {}) {
    const { status, upcoming } = filters;
    
    let where = { userId: parseInt(userId) };
    
    if (status) where.status = status;
    
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });
    
    // Filter by upcoming vs past events
    if (upcoming !== undefined) {
      const now = new Date();
      return bookings.filter(booking => {
        const eventDate = new Date(booking.event.date);
        return upcoming ? eventDate > now : eventDate < now;
      });
    }
    
    return bookings;
  },

  // Count bookings for an event
  async countByEvent(eventId) {
    return await prisma.booking.count({
      where: {
        eventId: parseInt(eventId),
        status: 'CONFIRMED'
      }
    });
  }
};

module.exports = Booking;