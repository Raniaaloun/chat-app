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

1. **Push your code to GitHub** (already done if you followed the setup)

2. **Create a new Web Service on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub account and select the `chat-app` repository
   - Choose the repository and click "Connect"

3. **Configure the service:**
   - **Name**: `pingm-backend` (or any name you prefer)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (we'll set commands to use `backend` folder)
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

4. **Set Environment Variables:**
   - In the Render dashboard, go to your service
   - Click on "Environment" tab
   - Click "Add Environment Variable" for each of the following:
   
   | Variable Name | Value | Description |
   |-------------|-------|-------------|
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `your-secret-key-here` | A random secret string (use a strong password generator) |
   | `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | From Cloudinary dashboard |
   | `CLOUDINARY_API_KEY` | `your-api-key` | From Cloudinary dashboard |
   | `CLOUDINARY_API_SECRET` | `your-api-secret` | From Cloudinary dashboard |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (set after deploying frontend) |
   | `PORT` | `5000` | Optional, Render sets this automatically |

5. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Note your backend URL (e.g., `https://pingm-backend.onrender.com`)

### Frontend (Vercel)

1. **Create a new project on Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository `Raniaaloun/chat-app`

2. **Configure the project:**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend` (important!)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `build` (default)
   - **Install Command**: `npm install` (default)

3. **Set Environment Variables:**
   - Before deploying, click "Environment Variables"
   - Add the following variables:
   
   | Variable Name | Value | Description |
   |-------------|-------|-------------|
   | `REACT_APP_API_URL` | `https://your-backend.onrender.com/api` | Your Render backend URL + `/api` |
   | `REACT_APP_SOCKET_URL` | `https://your-backend.onrender.com` | Your Render backend URL (without `/api`) |

   **Important:** 
   - Replace `your-backend.onrender.com` with your actual Render backend URL
   - These must start with `REACT_APP_` to be accessible in your React app
   - After adding variables, you may need to redeploy for them to take effect

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Note your frontend URL (e.g., `https://chat-app.vercel.app`)

5. **Update Backend Environment Variable:**
   - Go back to Render dashboard
   - Update the `FRONTEND_URL` environment variable with your Vercel frontend URL
   - This allows CORS to work properly
   - Redeploy the backend service

### Important Notes:

- **Order of Deployment**: Deploy backend first, then frontend (so you can use the backend URL in frontend env vars)
- **CORS**: Make sure `FRONTEND_URL` in backend matches your Vercel URL exactly
- **Environment Variables**: Never commit `.env` files to GitHub - they're already in `.gitignore`
- **Seeding Database**: After backend deployment, you may need to run the seed script. You can do this by:
  - SSH into your Render service (if available), or
  - Create a temporary endpoint to run the seed, or
  - Run it locally pointing to your production MongoDB URI

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
