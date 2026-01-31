# Flowspace Project Structure Guide

## 📁 Project Overview

Flowspace is a full-stack web application with a **React-based frontend** and a **Node.js/Express backend**. This guide explains the folder structure and the purpose of each directory and key file.

---

## 🏗️ Root Directory Structure

```
Flowspace/
├── client/           # Frontend application (React + Vite)
├── server/           # Backend application (Node.js + Express)
├── help/             # Documentation and help files
├── .git/             # Git version control
├── FOLDER_STRUCTURE.md  # This file
```

---

## 📱 Client Folder (`/client`)

The frontend React application built with Vite and Redux.

### Structure
```
client/
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite build configuration
├── eslint.config.js          # ESLint configuration for code quality
├── README.md                 # Client-specific documentation
├── index.html                # Main HTML entry point
├── public/                   # Static assets
├── src/                      # Source code
│   ├── main.jsx             # Application entry point
│   ├── App.jsx              # Root component
│   ├── App.css              # Root styles
│   ├── index.css            # Global styles
│   ├── assets/              # Images, icons, media files
│   ├── components/          # Reusable React components
│   ├── context/             # React Context for state management
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page-level components
│   ├── redux/               # Redux store, slices, and reducers
│   ├── services/            # API calls and external services
│   └── utils/               # Utility functions
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
- `KanbanColumn.jsx` - Individual Kanban columns
- `MembersPanel.jsx` - Team members display
- `NetworkStatus.jsx` - Network connection indicator
- `SearchBar.jsx` - Search functionality
- `Sidebar.jsx` - Navigation sidebar
- `SkeletonCard.jsx` - Loading skeleton component
- `StatCard.jsx` - Statistics card display
- `StatisticsPanel.jsx` - Statistics overview
- `TaskCard.jsx` - Individual task card
- `TaskDetailModal.jsx` - Task details modal
- `modals/` - Additional modal components

#### **context/**
React Context API for global state:
- `SocketContext.jsx` - WebSocket connection context

#### **hooks/**
Custom React hooks:
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
  - `statisticsSlice.js` - Statistics state
  - `taskSlice.js` - Task state
  - `workspaceSlice.js` - Workspace state

#### **services/**
API and external service integration:
- `api.js` - API calls to backend

#### **utils/**
Utility functions:
- `performance.js` - Performance monitoring and optimization

---

## 🖥️ Server Folder (`/server`)

The Node.js/Express backend application.

### Structure
```
server/
├── package.json           # Dependencies and scripts
├── src/                   # Source code
│   ├── server.js         # Main server entry point
│   ├── config/           # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/           # Database schemas/models
│   ├── routes/           # API routes
│   └── sockets/          # WebSocket event handlers
```

### Key Directories

#### **config/**
Server configuration:
- `socket.js` - WebSocket configuration

#### **controllers/**
Request handlers (business logic):
- `authController.js` - Authentication logic (login, signup, etc.)
- `taskController.js` - Task management logic
- `workspaceController.js` - Workspace management logic

#### **middleware/**
Express middleware:
- `auth.js` - Authentication middleware
- `socketAuth.js` - WebSocket authentication
- `workspace.js` - Workspace authorization middleware

#### **models/**
Database models/schemas:
- `User.js` - User schema and model
- `Task.js` - Task schema and model
- `Workspace.js` - Workspace schema and model

#### **routes/**
API endpoint definitions:
- `authRoutes.js` - `/api/auth/*` endpoints
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

**Last Updated**: January 18, 2026
