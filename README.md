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
- **React 19** - UI library
- **Vite 7** - Fast build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Recharts** - Data visualization
- **DnD Kit** - Drag and drop functionality
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or Atlas connection string)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Flowspace
```

### 2. Setup Backend Server

```bash
cd server

# Install dependencies
npm install

# Create .env file in the server directory
# Add the following environment variables:
# MONGO_URI=mongodb://localhost:27017/flowspace
# PORT=5000
# JWT_SECRET=your_jwt_secret_key

# Start the server
npm run dev    # Development with nodemon
npm start      # Production
```

The backend server will run on `http://localhost:5000`

### 3. Setup Frontend Client

```bash
cd client

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

The frontend will be available at `http://localhost:5173` (default Vite port)

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
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

**Backend:**
```bash
npm run dev     # Start with nodemon (auto-reload)
npm start       # Start production server
```

## 📈 Performance Features

- **Code Splitting** - Lazy loading of route components
- **Drag & Drop Optimization** - Smooth task reordering with DnD Kit
- **Real-time Sync** - Efficient WebSocket updates
- **Image Optimization** - Optimized asset loading
- **Redux Selector Memoization** - Prevent unnecessary re-renders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

### Server (.env)
```
MONGO_URI=mongodb://localhost:27017/flowspace
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Client (.env.local)
```
VITE_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check MONGO_URI in .env file
- Verify network connectivity if using MongoDB Atlas

### CORS Errors
- Check origin in server `cors()` configuration
- Ensure frontend and backend URLs match

### WebSocket Connection Failures
- Verify Socket.IO is initialized on backend
- Check browser console for connection errors
- Ensure JWT token is valid for socket authentication

### Port Already in Use
```bash
# Change PORT in .env or use different port
PORT=5001 npm run dev
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Redux Documentation](https://redux.js.org)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Socket.IO Guide](https://socket.io/docs)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Created with ❤️ for team collaboration and project management.

---

**Happy Collaborating! 🎉**

For issues or questions, please create an issue in the repository.
