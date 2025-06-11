# Club Registration System

A full-stack application for managing club registrations at Chandigarh University.

## Features

- Student registration form with multiple sections
- File upload for resumes
- Form validation
- Admin dashboard for managing registrations
- MongoDB database integration
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd club-registration
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

4. Create a `.env` file in the server directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/club-registration
JWT_SECRET=your_jwt_secret_key_here
```

5. Create an `uploads` directory in the server folder:
```bash
cd server
mkdir uploads
cd ..
```

## Running the Application

1. Start both frontend and backend servers:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

2. To run only the frontend:
```bash
npm start
```

3. To run only the backend:
```bash
npm run server
```

## API Endpoints

### Registration Endpoints

- `POST /api/registration` - Submit a new registration
- `GET /api/registration` - Get all registrations (admin only)
- `GET /api/registration/:id` - Get a specific registration
- `PATCH /api/registration/:id/status` - Update registration status (admin only)

## Project Structure

```
club-registration/
├── public/
├── src/
│   ├── App.js
│   ├── App.css
│   └── ...
├── server/
│   ├── models/
│   │   └── Registration.js
│   ├── routes/
│   │   └── registration.js
│   ├── uploads/
│   ├── index.js
│   └── .env
└── package.json
```

## Technologies Used

- Frontend:
  - React
  - CSS3
  - HTML5

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - Multer (for file uploads)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
