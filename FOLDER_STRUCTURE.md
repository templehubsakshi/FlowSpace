# Flowspace Project Structure Guide

## 📁 Project Overview

Flowspace is a full-stack web application with a **React-based frontend** and a **Node.js/Express backend**. This guide explains the folder structure and the purpose of each directory and key file.

---

## 🏗️ Root Directory Structure

```
Flowspace/
├── FOLDER_STRUCTURE.md    # This file
├── help                   # Documentation and help files
├── README.md             # Project documentation
├── client/               # Frontend application (React + Vite)
└── server/               # Backend application (Node.js + Express)
```

---

## 📱 Client Folder (`/client`)

The frontend React application built with Vite and Redux.

### Structure
```
client/
├── .gitignore                # Git ignore file
├── package.json              # Dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── vite.config.js            # Vite build configuration
├── eslint.config.js          # ESLint configuration for code quality
├── Tailwind.config           # Tailwind CSS configuration
├── README.md                 # Client-specific documentation
├── index.html                # Main HTML entry point
├── public/                   # Static assets
└── src/                      # Source code
    ├── main.jsx             # Application entry point
    ├── App.jsx              # Root component
    ├── App.css              # Root styles
    ├── index.css            # Global styles
    ├── components/          # Reusable React components
    │   ├── ActivityFeed.jsx
    │   ├── CreateTaskModal.jsx
    │   ├── CreateWorkspaceModal.jsx
    │   ├── EmptyState.jsx
    │   ├── ErrorBoundary.jsx
    │   ├── FilterPanel.jsx
    │   ├── InviteMemberModal.jsx
    │   ├── KanbanBoard.jsx
    │   ├── KanbanBoardSkeleton.jsx
    │   ├── KanbanColumn.jsx
    │   ├── LoadingButton.jsx
    │   ├── LoadingSpinner.jsx
    │   ├── MembersPanel.jsx
    │   ├── MentionDropdown.jsx
    │   ├── Modals.jsx
    │   ├── NetworkStatus.jsx
    │   ├── NotificationBell.jsx
    │   ├── NotificationDrawer.jsx
    │   ├── NotificationListener.jsx
    │   ├── SearchBar.jsx
    │   ├── Sidebar.jsx
    │   ├── SkeletonCard.jsx
    │   ├── StatCard.jsx
    │   ├── StatisticsPanel.jsx
    │   ├── TaskCard.jsx
    │   ├── TaskDetailModal.jsx
    │   ├── ThemeToggle.jsx
    │   ├── Form/
    │   │   └── Input.jsx
    │   └── modals/
    ├── context/             # React Context for state management
    │   ├── SocketContext.jsx
    │   └── ThemeContext.jsx
    ├── hooks/               # Custom React hooks
    │   ├── useNotificationSocket.js
    │   └── useWorkspaceSocket.js
    ├── pages/               # Page-level components
    │   ├── Dashboard.jsx
    │   ├── Login.jsx
    │   └── Signup.jsx
    ├── redux/               # Redux store, slices, and reducers
    │   ├── store.js
    │   └── slices/
    │       ├── authSlice.js
    │       ├── notificationSlice.js
    │       ├── statisticsSlice.js
    │       ├── taskSlice.js
    │       └── workspaceSlice.js
    ├── services/            # API calls and external services
    │   └── api.js
    └── utils/               # Utility functions
        ├── performance.js
        ├── spacing.js
        └── toast.js
```

### Key Directories

#### **components/**
Reusable React components:
- `ActivityFeed.jsx` - Display activities
- `CreateTaskModal.jsx` - Modal for creating tasks
- `CreateWorkspaceModal.jsx` - Modal for creating workspaces
- `EmptyState.jsx` - Empty state UI
- `ErrorBoundary.jsx` - Error handling boundary
- `FilterPanel.jsx` - Task filtering UI
- `InviteMemberModal.jsx` - Member invitation modal
- `KanbanBoard.jsx` - Main Kanban board
- `KanbanBoardSkeleton.jsx` - Kanban board loading skeleton
- `KanbanColumn.jsx` - Individual Kanban columns
- `LoadingButton.jsx` - Button with loading state
- `LoadingSpinner.jsx` - Loading spinner component
- `MembersPanel.jsx` - Team members display
- `MentionDropdown.jsx` - Dropdown for user mentions
- `Modals.jsx` - Modal components wrapper
- `NetworkStatus.jsx` - Network connection indicator
- `NotificationBell.jsx` - Notification bell icon
- `NotificationDrawer.jsx` - Notification drawer panel
- `NotificationListener.jsx` - Real-time notification listener
- `SearchBar.jsx` - Search functionality
- `Sidebar.jsx` - Navigation sidebar
- `SkeletonCard.jsx` - Loading skeleton component
- `StatCard.jsx` - Statistics card display
- `StatisticsPanel.jsx` - Statistics overview
- `TaskCard.jsx` - Individual task card
- `TaskDetailModal.jsx` - Task details modal
- `ThemeToggle.jsx` - Dark/Light theme toggle
- `Form/Input.jsx` - Form input component
- `modals/` - Additional modal components

#### **context/**
React Context API for global state:
- `SocketContext.jsx` - WebSocket connection context
- `ThemeContext.jsx` - Theme management context

#### **hooks/**
Custom React hooks:
- `useNotificationSocket.js` - Hook for real-time notifications
- `useWorkspaceSocket.js` - Hook for WebSocket workspace communication

#### **pages/**
Full-page components:
- `Dashboard.jsx` - Main dashboard page
- `Login.jsx` - User login page
- `Signup.jsx` - User registration page

#### **redux/**
Redux state management:
- `store.js` - Redux store configuration
- `slices/`
  - `authSlice.js` - Authentication state
  - `notificationSlice.js` - Notification state
  - `statisticsSlice.js` - Statistics state
  - `taskSlice.js` - Task state
  - `workspaceSlice.js` - Workspace state

#### **services/**
API and external service integration:
- `api.js` - API calls to backend

#### **utils/**
Utility functions:
- `performance.js` - Performance monitoring and optimization
- `spacing.js` - Spacing utility functions
- `toast.js` - Toast notification utilities

---

## 🖥️ Server Folder (`/server`)

The Node.js/Express backend application.

### Structure
```
server/
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
├── package-lock.json      # Locked dependency versions
└── src/                   # Source code
    ├── server.js         # Main server entry point
    ├── config/           # Configuration files
    │   └── socket.js
    ├── controllers/       # Request handlers
    │   ├── authController.js
    │   ├── notificationController.js
    │   ├── taskController.js
    │   └── workspaceController.js
    ├── middelware/        # Express middleware
    │   ├── auth.js
    │   ├── socketAuth.js
    │   └── workspace.js
    ├── models/           # Database schemas/models
    │   ├── Notification.js
    │   ├── Task.js
    │   ├── User.js
    │   └── Workspace.js
    ├── routes/           # API routes
    │   ├── authRoutes.js
    │   ├── notificationRoutes.js
    │   ├── taskRoutes.js
    │   └── workspaceRoutes.js
    └── sockets/          # WebSocket event handlers
        └── workspaceSocket.js
```

### Key Directories

#### **config/**
Server configuration:
- `socket.js` - WebSocket configuration

#### **controllers/**
Request handlers (business logic):
- `authController.js` - Authentication logic (login, signup, etc.)
- `notificationController.js` - Notification management logic
- `taskController.js` - Task management logic
- `workspaceController.js` - Workspace management logic

#### **middelware/**
Express middleware:
- `auth.js` - Authentication middleware
- `socketAuth.js` - WebSocket authentication
- `workspace.js` - Workspace authorization middleware

#### **models/**
Database models/schemas:
- `Notification.js` - Notification schema and model
- `Task.js` - Task schema and model
- `User.js` - User schema and model
- `Workspace.js` - Workspace schema and model

#### **routes/**
API endpoint definitions:
- `authRoutes.js` - `/api/auth/*` endpoints
- `notificationRoutes.js` - `/api/notifications/*` endpoints
- `taskRoutes.js` - `/api/tasks/*` endpoints
- `workspaceRoutes.js` - `/api/workspaces/*` endpoints

#### **sockets/**
WebSocket event handlers:
- `workspaceSocket.js` - Real-time workspace events (task updates, member changes, etc.)

---

## 📚 Help Folder (`/help`)

Documentation and help resources for the project.

---

## 🔄 Communication Flow

### Frontend → Backend
1. **REST API**: Client components make HTTP requests via `services/api.js`
2. **WebSocket**: Real-time updates via `useWorkspaceSocket()` hook
3. **Redux Store**: State managed via Redux slices
4. **Context**: Global state via React Context

### Backend → Frontend
1. **API Responses**: Controllers return JSON responses
2. **WebSocket Events**: Real-time events from `workspaceSocket.js`
3. **Database Models**: Data from MongoDB (or other DB)

---

## 🚀 Quick Navigation

| Task | Location |
|------|----------|
| Add new API endpoint | `server/src/routes/` + `server/src/controllers/` |
| Create new React component | `client/src/components/` |
| Add new page | `client/src/pages/` |
| Handle WebSocket events | `server/src/sockets/workspaceSocket.js` |
| Add authentication logic | `server/src/controllers/authController.js` |
| Manage global state | `client/src/redux/slices/` |
| Add database model | `server/src/models/` |
| Create custom hook | `client/src/hooks/` |
| Add middleware | `server/src/middleware/` |

---

## 📦 Key Technologies

**Frontend:**
- React (UI library)
- Vite (build tool)
- Redux (state management)
- React Context (global state)
- Socket.IO (real-time communication)

**Backend:**
- Node.js (runtime)
- Express (web framework)
- Socket.IO (real-time communication)
- MongoDB (database - inferred from models)

---

## 🔧 Development Workflow

1. **Frontend Development**: Work in `client/src/` and run `npm run dev` in `/client`
2. **Backend Development**: Work in `server/src/` and run `npm start` in `/server`
3. **API Integration**: Use `services/api.js` to connect frontend to backend
4. **Real-time Features**: Use WebSocket via `useWorkspaceSocket.js` hook
5. **State Management**: Use Redux slices for global state

---

## 📝 Notes

- **Middleware**: Server applies middleware in sequence for request processing
- **Authentication**: Protected routes use `auth.js` middleware
- **WebSocket**: Real-time communication handled in both frontend context and backend sockets
- **Modals**: UI modals located in `components/` with modal-specific ones in `modals/` subfolder

---

## 🤝 Team Collaboration

This structure allows:
- **Frontend developers** to work in `/client` independently
- **Backend developers** to work in `/server` independently
- **Full-stack developers** to connect both layers
- **Clear separation of concerns** for maintainability
- **Easy navigation** for new team members

---

**Last Updated**: February 14, 2026
