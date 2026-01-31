# 🚀 FlowSpace - Project Management Tool

A modern, full-stack project management application built with **React**, **Redux**, **Node.js**, **Express**, and **MongoDB**. FlowSpace enables teams to collaborate seamlessly with real-time task management, workspace organization, and team coordination features.

## ✨ Features

### 🎯 Core Features
- **Workspace Management** - Create and manage multiple workspaces for different projects
- **Kanban Board** - Drag-and-drop task management with Todo, In Progress, and Done columns
- **Task Management** - Create, assign, and track tasks with priority levels and due dates
- **Real-time Collaboration** - WebSocket-powered live updates across all team members
- **Team Members** - Invite members, manage roles (Owner, Admin, Member), and track collaboration
- **Statistics Dashboard** - Visualize project progress with charts and analytics
- **Activity Feed** - Track all workspace activities and changes in real-time
- **Search & Filter** - Quickly find tasks by status, priority, and other criteria
- **User Authentication** - Secure login/signup with JWT tokens

### 🔐 Security
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (Owner, Admin, Member)
- CORS-enabled API with secure cookie handling
- Socket.IO authentication middleware

## 🏗️ Project Structure

```
Flowspace/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components (Login, Signup, Dashboard)
│   │   ├── redux/          # Redux store and slices
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service calls
│   │   ├── context/        # React Context (Socket)
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite build configuration
│
├── server/                 # Node.js Backend (Express)
│   ├── src/
│   │   ├── models/         # MongoDB schemas (User, Task, Workspace)
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── sockets/        # WebSocket handlers
│   │   ├── config/         # Configuration files
│   │   └── server.js       # Server entry point
│   └── package.json        # Backend dependencies
│
└── README.md               # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library with latest features
- **Vite 7.2** - Next-generation build tool and dev server
- **Redux Toolkit 2.11** - State management
- **React Router 7.11** - Client-side routing
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Socket.IO Client 4.8** - Real-time communication
- **Recharts 3.6** - Data visualization
- **DnD Kit** - Drag and drop functionality (Core 6.3, Sortable 10.0)
- **Lucide React 0.561** - Icon library
- **Axios 1.13** - HTTP client
- **React Hot Toast 2.6** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18.x or higher recommended, minimum v16.x)
- **npm** (v8.x or higher) or **yarn** (v1.22.x or higher)
- **MongoDB** (v5.0 or higher) - Local installation or MongoDB Atlas account

## 🚀 Getting Started

### 1. Clone the Repository
```bash
[git clone https://github.com/yourusername/flowspace.git](https://github.com/templehubsakshi/FlowSpace.git)
cd Flowspace
```

### 2. Setup Backend Server

```bash
cd server

# Install dependencies
npm install

# Create .env file in the server directory
# Copy the example below and add your actual values
```

**Create `server/.env` file:**
```env
MONGO_URI=mongodb://localhost:27017/flowspace
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

> **Security Tip:** Generate a strong JWT secret using: `openssl rand -base64 32`

**Start the server:**
```bash
npm run dev    # Development with nodemon (auto-reload)
npm start      # Production
```

The backend server will run on `http://localhost:5000`

### 3. Setup Frontend Client

```bash
cd client

# Install dependencies
npm install
```

**Create `client/.env.local` file (optional):**
```env
VITE_API_URL=http://localhost:5000
```

**Start the development server:**
```bash
npm run dev    # Start Vite dev server with HMR

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend will be available at `http://localhost:5173` (default Vite port)

### 4. Verify Installation

**Check Backend:**
- Terminal should show: `✓ Connected to MongoDB` and `✓ Server running on port 5000`
- Visit `http://localhost:5000` - You should see a response (or test an API endpoint)

**Check Frontend:**
- Browser should automatically open to `http://localhost:5173`
- No console errors in browser DevTools
- Application should load the login/signup page

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Verify authentication status

### Workspace Routes (`/api/workspaces`)
- `GET /api/workspaces` - Fetch all user workspaces
- `POST /api/workspaces` - Create new workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/invite` - Invite member to workspace

### Task Routes (`/api/tasks`)
- `GET /api/tasks` - Fetch workspace tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status

## 🔌 WebSocket Events

Real-time updates are powered by Socket.IO:

### Workspace Events
- `workspace:task-created` - New task created
- `workspace:task-updated` - Task updated
- `workspace:task-deleted` - Task deleted
- `workspace:member-joined` - Member joined workspace
- `workspace:member-left` - Member left workspace

## 📁 Key Components

### Frontend Components
- **Dashboard** - Main application interface with tabs for Board, Statistics, and Members
- **KanbanBoard** - Drag-and-drop task board with columns
- **TaskCard** - Individual task display with priority and assignee
- **CreateTaskModal** - Form to create new tasks
- **StatisticsPanel** - Charts showing project progress
- **MembersPanel** - Team member management
- **Sidebar** - Navigation and workspace selector
- **ErrorBoundary** - Error handling component

### Backend Models
- **User** - User account data and authentication
- **Workspace** - Project workspace with members and roles
- **Task** - Individual task with status, priority, and assignments

## 🧠 State Management

Redux store structure:
```
store
├── auth - User authentication and profile
├── workspace - Current workspace and members
├── task - Workspace tasks and filters
└── statistics - Project analytics data
```

## 🔐 Authentication Flow

1. User registers/logs in via `/api/auth/signup` or `/api/auth/login`
2. Backend returns JWT token stored in localStorage
3. Token is sent with each API request via Authorization header
4. Socket.IO connections authenticated via token middleware
5. Logout clears token and ends user session

## 🌐 Real-time Features

FlowSpace uses Socket.IO for real-time collaboration:
- Live task updates across all connected team members
- Instant member status notifications
- Real-time activity feed
- Concurrent task editing notifications

## 📊 Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Workspace Collection
```javascript
{
  name: String,
  description: String,
  owner: ObjectId (User),
  members: [{
    user: ObjectId (User),
    role: String (owner/admin/member),
    joinedAt: Date
  }],
  createdAt: Date
}
```

### Task Collection
```javascript
{
  title: String,
  description: String,
  status: String (todo/in_progress/done),
  priority: String (low/medium/high/urgent),
  workspace: ObjectId (Workspace),
  assignee: ObjectId (User),
  creator: ObjectId (User),
  dueDate: Date,
  tags: [String],
  order: Number,
  comments: [{...}],
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Development

### Available Scripts

**Frontend:**
```bash
npm run dev     # Start Vite dev server with HMR at http://localhost:5173
npm run build   # Build optimized production bundle to /dist
npm run preview # Preview production build locally
npm run lint    # Run ESLint to check code quality
```

**Backend:**
```bash
npm run dev     # Start server with nodemon (auto-reload on file changes)
npm start       # Start production server with node
```

## 📈 Performance Features

- **Code Splitting** - Lazy loading of route components
- **Drag & Drop Optimization** - Smooth task reordering with DnD Kit
- **Real-time Sync** - Efficient WebSocket updates
- **Image Optimization** - Optimized asset loading
- **Redux Selector Memoization** - Prevent unnecessary re-renders




## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already added to `.gitignore`
2. **Use strong JWT secrets** - Generate with: `openssl rand -base64 32`
3. **Enable HTTPS in production** - Use SSL/TLS certificates
4. **Implement rate limiting** - Prevent API abuse
5. **Validate all inputs** - Sanitize user data on both client and server
6. **Use environment variables** - Never hardcode secrets
7. **Keep dependencies updated** - Regularly run `npm audit` and `npm update`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables Reference

### Server (`server/.env`)
```env
# Database
MONGO_URI=mongodb://localhost:27017/flowspace
# or MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/flowspace

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Client (`client/.env.local`)
```env
# API Configuration
VITE_API_URL=http://localhost:5000


```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running: `sudo systemctl status mongod` (Linux) or check MongoDB Compass
- Check `MONGO_URI` in `.env` file for typos
- Verify network connectivity if using MongoDB Atlas
- Check firewall rules and IP whitelist in MongoDB Atlas

### CORS Errors
- Verify `CORS_ORIGIN` in server `.env` matches your frontend URL exactly
- Check that frontend is running on the expected port (default: 5173)
- Clear browser cache and try again

### WebSocket Connection Failures
- Verify Socket.IO is properly initialized in both client and server
- Check browser console for connection errors
- Ensure JWT token is valid and not expired
- Check network tab in DevTools for WebSocket handshake


## 👨‍💻 Author

Created with ❤️ for team collaboration and project management.

For issues, questions, or feature requests, please create an issue in the repository.

---

**Happy Collaborating! 🎉**
