# Event Booking System

A full-stack web application for managing and booking events, built with React.js frontend and Node.js backend.

## 🚀 Live Demo

- **Frontend**: [https://eventbooking-one.vercel.app](https://eventbooking-one.vercel.app)
- **Backend API**: [https://eventbooking-backend-y5kn.onrender.com](https://eventbooking-backend-y5kn.onrender.com)
- **API Documentation**: [https://eventbooking-backend-y5kn.onrender.com/api-docs](https://eventbooking-backend-y5kn.onrender.com/api-docs)

## 📋 Features

- **User Authentication**: Register, login, and secure JWT-based authentication
- **Event Management**: Create and view events
- **Event Booking**: Book events and manage bookings
- **Real-time Updates**: Live notifications using Socket.IO
- **Responsive Design**: Mobile-friendly interface
- **API Documentation**: Interactive Swagger documentation

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Swagger** - API documentation

## 📁 Project Structure

```
event-booking-system/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (AuthContext)
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions (api.js)
│   │   └── App.js
│   ├── package.json
│   └── .env.local
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── app.js          # Main server file
│   ├── prisma/             # Database schema and migrations
│   ├── package.json
│   └── .env
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** database
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/isimbi02/EventBooking.git
cd EventBooking
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file:**

```env
# Database
DATABASE_URL="postgresql://username:passwor@localhost:5433/eventbooking"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

**Set up the database:**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Optional: Seed the database
npx prisma db seed
```

**Start the backend server:**

```bash
npm run dev
```

The backend will be running at `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

**Configure your `.env.local` file:**

```env
REACT_APP_API_URL=http://localhost:5000
```

**Start the frontend development server:**

```bash
npm start
```

The frontend will be running at `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

### Main API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (authenticated)
- `PATCH /api/events/:id` - Update event (authenticated)
- `DELETE /api/events/:id` - Delete event (authenticated)

#### Bookings
- `GET /api/bookings` - Get user bookings (authenticated)
- `POST /api/bookings` - Book an event (authenticated)
- `DELETE /api/bookings/:id` - Cancel booking (authenticated)

## 🚀 Deployment

### Backend (Render)

1. Create account on [Render](https://render.com)
2. Connect your GitHub repository
3. Create a new **Web Service**
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
5. Add environment variables in Render dashboard
6. Deploy

### Frontend (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variables:
   - `REACT_APP_API_URL`: Your Render backend URL
5. Deploy

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npx prisma studio` - Open Prisma database studio

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🐛 Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure backend CORS is configured to allow your frontend domain
- Check that API URLs are correct in frontend

**Database Connection:**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run `npx prisma migrate dev` if migrations are pending

**Authentication Issues:**
- Check JWT_SECRET is set in backend
- Verify token storage in frontend localStorage

**API Not Found (404):**
- Ensure all API routes include `/api` prefix
- Check that backend routes are properly registered

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License





## 🙏 Acknowledgments

- React.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and supporters

---

