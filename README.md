# Admin Dashboard Backend

A robust backend API for the Admin Dashboard application, providing comprehensive management and monitoring capabilities.

## Features

- User authentication and authorization
- RESTful API endpoints
- Database integration
- Error handling and logging
- Role-based access control
- Real-time data management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB or your preferred database

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with required environment variables
```
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
PORT=5000
```

4. Start the server
```bash
npm start
```

## Project Structure

```
Backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── config/
├── tests/
├── .env.example
├── server.js
└── package.json
```

## API Documentation

All API endpoints are available at `http://localhost:5000/api`

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- POST `/api/auth/logout` - User logout

### Admin Operations
- GET `/api/admin/dashboard` - Get dashboard data
- GET `/api/admin/users` - List all users
- POST `/api/admin/users` - Create new user

## Environment Variables

- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Running Tests

```bash
npm test
```

## License

MIT

## Support

For issues or questions, please contact the development team.