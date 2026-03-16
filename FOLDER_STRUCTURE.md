# Flowspace Project Structure

## Overview
Flowspace is a full-stack task management and collaboration application with real-time updates using WebSockets.

## Directory Structure

```
Flowspace/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   ├── ActivityFeed.jsx
│   │   │   ├── Calendarview.jsx
│   │   │   ├── CreateTaskModal.jsx
│   │   │   ├── CreateWorkspaceModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── InviteMemberModal.jsx
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── KanbanBoardSkeleton.jsx
│   │   │   ├── KanbanColumn.jsx
│   │   │   ├── LoadingButton.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── MembersPanel.jsx
│   │   │   ├── MentionDropdown.jsx
│   │   │   ├── Modals.jsx
│   │   │   ├── NetworkStatus.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── NotificationDrawer.jsx
│   │   │   ├── NotificationListener.jsx
│   │   │   ├── RightPanel.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatisticsPanel.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskDetailModal.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── Form/
│   │   │       └── Input.jsx
│   │   ├── context/                # React Context for global state
│   │   │   ├── SocketContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useNotificationSocket.js
│   │   │   ├── Usesocket.js
│   │   │   ├── useTheme.js
│   │   │   └── useWorkspaceSocket.js
│   │   ├── pages/                  # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── redux/                  # Redux store and slices
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── notificationSlice.js
│   │   │       ├── statisticsSlice.js
│   │   │       ├── taskSlice.js
│   │   │       └── workspaceSlice.js
│   │   ├── services/               # API and external service calls
│   │   │   └── api.js
│   │   ├── utils/                  # Utility functions
│   │   │   ├── performance.js
│   │   │   ├── spacing.js
│   │   │   └── toast.js
│   │   ├── App.jsx                 # Root component
│   │   ├── App.css                 # Global styles
│   │   ├── index.css               # Main stylesheet
│   │   └── main.jsx                # Entry point
│   ├── index.html                  # HTML template
│   ├── package.json                # Frontend dependencies
│   ├── eslint.config.js            # ESLint configuration
│   ├── Tailwind.config.js          # Tailwind CSS configuration
│   ├── vite.config.js              # Vite build configuration
│   ├── vercel.json                 # Vercel deployment config
│   └── README.md                   # Frontend documentation
│
├── server/                         # Backend Node.js/Express application
│   ├── src/
│   │   ├── config/                 # Configuration files
│   │   │   └── socket.js           # Socket.io configuration
│   │   ├── controllers/            # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── notificationController.js
│   │   │   ├── taskController.js
│   │   │   └── workspaceController.js
│   │   ├── middelware/             # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── socketAuth.js
│   │   │   └── workspace.js
│   │   ├── models/                 # MongoDB/Database models
│   │   │   ├── Notification.js
│   │   │   ├── Task.js
│   │   │   ├── User.js
│   │   │   └── Workspace.js
│   │   ├── routes/                 # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── workspaceRoutes.js
│   │   ├── sockets/                # WebSocket handlers
│   │   │   └── workspaceSocket.js
│   │   └── server.js               # Main server entry point
│   ├── package.json                # Backend dependencies
│   └── README.md                   # Backend documentation
│
├── README.md                       # Project root documentation
├── PROJECT_DOCUMENTATION.md        # Detailed project documentation
├── FOLDER_STRUCTURE.md             # This file
└── help/                           # Help and guides directory
```

## Key Features

### Frontend (React)
- **Real-time Updates**: WebSocket integration for live collaboration
- **State Management**: Redux for global application state
- **Task Management**: Kanban board, calendar view, and task details
- **Notifications**: Real-time notification system
- **Dark/Light Theme**: Theme switching capability
- **Responsive UI**: Tailwind CSS for styling
- **User Authentication**: Login and signup pages

### Backend (Node.js/Express)
- **RESTful API**: Complete API for all operations
- **Real-time Communication**: Socket.io for WebSocket connections
- **Authentication**: JWT-based user authentication
- **Database Models**: MongoDB models for users, tasks, workspaces, and notifications
- **Workspace Management**: Multi-workspace support with team collaboration
- **Middleware**: Authentication, authorization, and workspace validation

## Technology Stack

### Frontend
- React 18+
- Redux for state management
- Tailwind CSS for styling
- Vite for build tooling
- Socket.io client for real-time updates

### Backend
- Node.js with Express
- Socket.io for WebSocket communication
- MongoDB for database
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Setup environment variables**
   Create `.env` files in both client and server directories with necessary configurations.

5. **Run the application**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm start

   # Terminal 2: Start frontend development server
   cd client
   npm run dev
   ```

## File Structure Notes

- **components/**: Modular, reusable UI components
- **pages/**: Full-page components (Login, Signup, Dashboard)
- **context/**: Global context providers for theme and socket connections
- **hooks/**: Custom React hooks for socket and theme management
- **redux/**: Centralized state management
- **services/**: API call functions
- **controllers/**: Backend route handlers
- **models/**: Data schema definitions
- **routes/**: API endpoint definitions
- **middleware/**: Request/response processing

## Contributing

Ensure the folder structure is maintained when adding new features:
- Place components in the `components/` directory
- Create utility functions in `utils/`
- Add API calls in `services/`
- Create new Redux slices for major state additions

---

*Last Updated: March 1, 2026*
