const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http=require('http')
require('dotenv').config();
const workspaceSocket = require('./sockets/workspaceSocket');



const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const taskRoutes = require('./routes/taskRoutes'); // ADD

//socket config
const { initializeSocket }=require('./config/socket')
const socketAuthMiddleware=require('./middelware/socketAuth')
const handleWorkspaceSocket=require('./sockets/workspaceSocket')

const app = express();

const server=http.createServer(app);
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', taskRoutes); // ADD
const notificationRoutes=require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);
  
//Initialize Socket
const io=initializeSocket(server);
io.use(socketAuthMiddleware);

io.on('connection',(socket)=>{
  console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);
  handleWorkspaceSocket(io, socket);
})
// workspaceSocket.io = io;
app.get('/health', (req, res) => {
  res.json({ message: 'FlowSpace API running!' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
});