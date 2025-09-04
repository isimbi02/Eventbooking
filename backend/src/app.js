const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

// Import Prisma client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {  // Fixed: was "javascriptcors"
    origin: [
      "http://localhost:3000",
      "https://eventbooking-one.vercel.app",
      "https://eventbooking-a8j5fzmmk-deborah-rutagengwas-projects.vercel.app"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
});

// Store io instance in app for use in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://eventbooking-one.vercel.app",
    "https://eventbooking-a8j5fzmmk-deborah-rutagengwas-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Event Booking API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('event-updated', (data) => {
    socket.broadcast.emit('event-update', data);
  });
  
  socket.on('booking-created', (data) => {
    socket.broadcast.emit('booking-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Prisma error handling
  if (err.code === 'P2002') {
    return res.status(409).json({ 
      message: 'A record with this already exists' 
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({ 
      message: 'Record not found' 
    });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Database connection check
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully via Prisma');
    
    // Test query to ensure database is accessible
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database test query successful');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1); // Exit if database connection fails
  }
}

const PORT = process.env.PORT || 5000;

// Start server only after database connection is verified
async function startServer() {
  try {
    await checkDatabaseConnection();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health check at http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔗 Database URL: ${process.env.DATABASE_URL}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = { app, server, io, prisma };