const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Booking API',
      version: '1.0.0',
      description: 'API documentation for the Event Booking System with JWT Authentication',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        Event: {
          type: 'object',
          required: ['title', 'description', 'date', 'location', 'category', 'capacity'],
          properties: {
            title: { type: 'string', example: 'Tech Conference 2023' },
            description: { type: 'string', example: 'Annual technology conference' },
            date: { type: 'string', format: 'date-time', example: '2023-12-15T09:00:00Z' },
            location: { type: 'string', example: 'Convention Center, New York' },
            category: {
              type: 'string',
              enum: ['CONFERENCE', 'WORKSHOP', 'SEMINAR', 'NETWORKING', 'SOCIAL'],
              example: 'CONFERENCE',
            },
            capacity: { type: 'integer', minimum: 1, example: 100 },
            imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            eventId: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['CONFIRMED', 'CANCELLED', 'PENDING'], example: 'CONFIRMED' },
          },
        },
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Authentication failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string', example: 'Invalid value' },
                  param: { type: 'string', example: 'email' },
                  location: { type: 'string', example: 'body' },
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Authentication required' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                message: 'Validation failed',
                errors: [{ msg: 'Invalid email', param: 'email', location: 'body' }],
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
