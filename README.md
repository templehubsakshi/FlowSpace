<div align="center">

<img src="https://img.shields.io/badge/FlowSpace-Real--time%20Collaboration-6366f1?style=for-the-badge&logo=lightning&logoColor=white" alt="FlowSpace" />

# ⚡ FlowSpace

### Real-time Collaborative Task Management — Built for Modern Teams

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-flow--space--black.vercel.app-6366f1?style=flat-square)](https://flow-space-black.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=flat-square&logo=redux)](https://redux-toolkit.js.org)

</div>

---

## 📌 Overview

**FlowSpace** is a full-stack, real-time collaborative task management application. Teams can create shared workspaces, manage tasks on a drag-and-drop Kanban board, collaborate live with Socket.IO, and track progress through detailed analytics — all in a beautifully designed interface with full dark/light mode support.

> Built as a production-grade MERN stack project with httpOnly cookie auth, role-based access control, real-time sync across all connected clients, and a responsive UI that works seamlessly from mobile to desktop.

---

## 🌐 Live Demo

**[https://flow-space-black.vercel.app](https://flow-space-black.vercel.app)**

| Test Account | Credentials |
|---|---|
| Owner | `yuvraj@demo.com` / `demo123` |
| Member | `sakshu@demo.com` / `demo123` |

---

## ✨ Features

### 🗂️ Workspace Management
- Create multiple workspaces with custom names, descriptions, and color themes
- Invite members by email with role assignment (Owner / Admin / Member)
- Role-based access control — only owners can change member roles, only admins/owners can invite
- Export workspace data as **JSON** or **CSV** with one click
- 3-step confirmation for irreversible workspace deletion

### 📋 Kanban Board
- Drag-and-drop tasks across **To Do**, **In Progress**, and **Done** columns using `@dnd-kit`
- Optimistic UI updates — board feels instant, rolls back cleanly on failure
- Real-time sync — any teammate's drag/create/delete appears on your board within milliseconds
- Search tasks by title, description, or tags
- Filter tasks by priority, status, and assignee simultaneously

### ✅ Task Management
- Rich task creation: title, description, priority (Low/Medium/High/Urgent), status, assignee, due date, tags
- Overdue detection with visual indicators
- Inline comments with **@mention** support and member dropdown autocomplete
- Real-time comment sync across all clients

### 📊 Analytics Dashboard
- Completion rate progress bar
- Task breakdown by status (donut chart) and priority (bar chart)
- 7-day activity area chart (created vs completed)
- Team performance leaderboard with per-member completion rates
- Quick insights: top contributor, busiest priority, daily velocity, pending count

### 📅 Calendar View
- Month and week views
- Tasks plotted by due date with status color coding
- Overdue indicators and upcoming tasks sidebar panel
- Click any date to create a task with that due date pre-filled

### 🔔 Notifications
- Real-time notification delivery via Socket.IO
- Notification types: task assigned, commented, mentioned, status changed, member joined/left
- Mark individual or all as read
- Bell badge with live unread count

### 🌗 Theme System
- Full dark and light mode with smooth transitions
- Theme persists across sessions via localStorage
- Custom CSS variable system — every component adapts automatically

### 📱 Responsive Design
- Mobile-first layouts across all views
- Collapsible sidebar with hamburger menu on mobile
- Scrollable Kanban on small screens
- Adaptive stats grids and chart sizing

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library with hooks |
| **Redux Toolkit** | Global state management |
| **Socket.IO Client** | Real-time bidirectional events |
| **@dnd-kit** | Accessible drag-and-drop |
| **Recharts** | Analytics charts |
| **React Router v6** | Client-side routing |
| **React Hot Toast** | Toast notifications |
| **Lucide React** | Icon system |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database + ODM |
| **Socket.IO** | WebSocket server |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT generation |
| **cookie-parser** | httpOnly cookie handling |
| **cors** | Cross-origin configuration |

### Infrastructure
| Service | Usage |
|---|---|
| **Vercel** | Frontend deployment |
| **Render / Railway** | Backend deployment |
| **MongoDB Atlas** | Cloud database |

---

## 🏗️ Architecture

```
flowspace/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/              # 25+ reusable UI components
│   │   │   ├── KanbanBoard.jsx      # DnD board with real-time sync
│   │   │   ├── TaskCard.jsx         # Sortable task card
│   │   │   ├── StatisticsPanel.jsx  # Full analytics dashboard
│   │   │   ├── CalendarView.jsx     # Month/week calendar
│   │   │   ├── MembersPanel.jsx     # Team management
│   │   │   ├── NotificationDrawer.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── SocketContext.jsx    # Socket.IO provider
│   │   │   └── ThemeContext.jsx     # Dark/light theme provider
│   │   ├── hooks/
│   │   │   ├── useWorkspaceSocket.js  # Real-time task events
│   │   │   ├── useNotificationSocket.js
│   │   │   └── Usesocket.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main app shell
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── taskSlice.js
│   │   │   │   ├── workspaceSlice.js
│   │   │   │   ├── notificationSlice.js
│   │   │   │   └── statisticsSlice.js
│   │   │   └── store.js             # Root reducer with full reset on logout
│   │   └── services/
│   │       └── api.js               # Axios instance + interceptors
│
└── server/                          # Express backend
    └── src/
        ├── controllers/
        │   ├── authController.js
        │   ├── taskController.js
        │   ├── workspaceController.js
        │   └── notificationController.js
        ├── middleware/
        │   ├── auth.js              # JWT verification from httpOnly cookie
        │   ├── workspace.js         # Role-based route protection
        │   └── socketAuth.js        # Socket handshake auth
        ├── models/
        │   ├── Task.js
        │   ├── User.js
        │   ├── Workspace.js
        │   └── Notification.js
        ├── routes/
        │   ├── authRoutes.js
        │   ├── taskRoutes.js
        │   ├── workspaceRoutes.js
        │   └── notificationRoutes.js
        ├── socket/
        │   └── workspaceSocket.js   # All socket event handlers
        └── server.js
```

---

## 🔐 Authentication & Security

- **httpOnly cookies** — JWT never stored in localStorage, immune to XSS
- **Cookie-based auth** — `withCredentials: true` on all requests, cookie sent automatically
- **Role-based access control** — Owner > Admin > Member permission hierarchy
- **Route protection** — middleware validates cookie on every protected endpoint
- **Socket auth** — WebSocket handshake verifies the same JWT cookie
- **Full state reset on logout** — Redux `rootReducer` sets `state = undefined` on logout/force-logout, preventing any data leak between user sessions
- **Force logout** — `api.js` 401 interceptor fires `force-logout` event; App.jsx listens and clears all state + redirects

---

## ⚡ Real-time Architecture

```
Client A                    Server                     Client B
   │                           │                           │
   │── task:create ──────────► │                           │
   │                           │── task:created ─────────► │
   │                           │                           │
   │── task:move ───────────► │                            │
   │   (optimistic update)     │── task:moved ───────────► │
   │                           │   (_partialMove flag)     │
   │── comment:add ──────────► │                           │
   │                           │── comment:added ────────► │
   │                           │── notification:new ─────► │
```

Key design decisions:
- **Optimistic updates** for drag-and-drop: UI moves instantly, rolls back on API failure
- **`_partialMove` flag** in socket handler: task:moved only patches `status` field, never replaces the full task object (prevents wiping title/tags/assignee)
- **Split notification responsibilities**: `NotificationListener` (global) only refreshes unread count; `useNotificationSocket` (dashboard) handles toasts and list updates — prevents duplicate notifications

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/flowspace.git
cd flowspace
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the dev server:
```bash
npm run dev
```

### 4. Open in browser

```
http://localhost:5173
```

---

## 🔑 Environment Variables

### Server (`server/.env`)
| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default: 5000) | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for signing JWTs (32+ chars) | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `NODE_ENV` | `development` or `production` | Yes |

### Client (`client/.env`)
| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_SOCKET_URL` | Socket.IO server URL | Yes |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login, sets httpOnly cookie | No |
| GET | `/api/auth/me` | Verify session, return user | Yes |
| POST | `/api/auth/logout` | Clear auth cookie | Yes |

### Workspaces
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/workspaces` | Get user's workspaces | Yes |
| POST | `/api/workspaces` | Create workspace | Yes |
| PUT | `/api/workspaces/:id` | Update workspace | Admin+ |
| DELETE | `/api/workspaces/:id` | Delete workspace | Owner |
| POST | `/api/workspaces/:id/invite` | Invite member by email | Admin+ |
| DELETE | `/api/workspaces/:id/members/:memberId` | Remove member | Admin+ |
| PATCH | `/api/workspaces/:id/members/:memberId/role` | Change member role | Owner |

### Tasks
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks/workspace/:workspaceId` | Get all tasks (grouped by status) | Member+ |
| POST | `/api/tasks` | Create task | Member+ |
| PUT | `/api/tasks/:id` | Update task | Member+ |
| DELETE | `/api/tasks/:id` | Delete task | Creator/Admin+ |
| PATCH | `/api/tasks/:id/move` | Move task (status + order) | Member+ |
| POST | `/api/tasks/:id/comments` | Add comment with @mentions | Member+ |
| DELETE | `/api/tasks/:id/comments/:commentId` | Delete comment | Creator |

### Notifications
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/notifications` | Get notification list | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |
| PATCH | `/api/notifications/mark-all-read` | Mark all as read | Yes |
| PATCH | `/api/notifications/:id` | Mark single as read | Yes |
| DELETE | `/api/notifications/:id` | Delete single | Yes |
| DELETE | `/api/notifications` | Clear all | Yes |

---

## 🔌 Socket Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `workspace:join` | `workspaceId` | Join workspace room |
| `workspace:leave` | `workspaceId` | Leave workspace room |
| `task:create` | `{ workspaceId, task }` | Broadcast new task |
| `task:move` | `{ workspaceId, taskId, newStatus, oldStatus, newOrder }` | Broadcast task move |
| `task:delete` | `{ workspaceId, taskId }` | Broadcast task deletion |
| `comment:add` | `{ workspaceId, taskId, comment }` | Broadcast new comment |

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `task:created` | `{ task }` | New task created by another user |
| `task:updated` | `{ task, updatedBy }` | Task edited by another user |
| `task:moved` | `{ taskId, newStatus, oldStatus }` | Task moved by another user |
| `task:deleted` | `{ taskId }` | Task deleted by another user |
| `comment:added` | `{ taskId, comment }` | Comment added by another user |
| `notification:new` | Notification object | New notification for this user |
| `user:joined` | `{ userName }` | User joined workspace |
| `user:left` | `{ userName }` | User left workspace |

---

## 🎨 Design System

FlowSpace uses a custom CSS variable-based design system:

- **Two-layer theming**: CSS variables at `:root` (light) and `.dark` class (dark)
- **Token categories**: surfaces, borders, text hierarchy, brand, status colors, shadows, transitions
- **Component tokens**: semantic variables like `--surface-sunken`, `--text-tertiary`, `--brand-primary`
- **Smooth transitions**: `background-color`, `border-color`, `color` all transition at 250ms on theme toggle
- **Responsive breakpoints**: 480px (mobile), 768px (tablet), 900px (sidebar collapse), 1024px (desktop), 1200px (wide)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built with ❤️ by **Yuvraj**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/YOUR_USERNAME)

---

<div align="center">

**[⬆ Back to top](#-flowspace)**

If you found this project useful, please consider giving it a ⭐

</div>