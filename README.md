# PingM - Chat Application

A real-time chat application with role-based messaging. Normal users can only chat with Montaser, while Montaser can chat with anyone.

## Features

- 🔐 Authentication (Registration for normal users only)
- 💬 Real-time messaging with Socket.io
- 📸 Share images from gallery
- 🎥 Share videos
- 🎤 Voice notes recording
- 👥 Role-based chat permissions
- 🎨 Modern, responsive UI

## Tech Stack

### Frontend
- React 18
- React Router
- Socket.io Client
- Axios
- React Icons

### Backend
- Node.js
- Express
- MongoDB (MongoDB Atlas)
- Socket.io
- JWT Authentication
- Cloudinary (for file storage)
- Multer (for file uploads)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here_change_in_production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

4. Seed the Montaser user:
```bash
npm run seed
```

5. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional, defaults are set):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Getting Free Services

### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a free cluster (M0)
4. Create a database user
5. Whitelist your IP (0.0.0.0/0 for development)
6. Get your connection string and update `.env`

### Cloudinary
1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account
3. Get your cloud name, API key, and API secret from the dashboard
4. Update `.env` with these credentials

## Deployment

### Backend (Render)
1. Push your code to GitHub
2. Connect your repository to Render
3. Set the following environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` (your frontend URL)
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set root directory to `frontend`
4. Set environment variables:
   - `REACT_APP_API_URL` (your backend URL + /api)
   - `REACT_APP_SOCKET_URL` (your backend URL)
5. Deploy

## Usage

1. **Normal Users**: Register with email, username, and password. You can only chat with Montaser.

2. **Montaser**: Pre-seeded account. Can chat with all users. Default login credentials:
   - Email: `montaser@pingm.com`
   - Password: `montaser123`
   - ⚠️ **Important**: Change this password in production!

## Project Structure

```
PingM/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── messages.js
│   │   └── upload.js
│   ├── utils/
│   │   └── seed.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## License

ISC
