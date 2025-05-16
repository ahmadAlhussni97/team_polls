require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/poll');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());          // Enable CORS
app.use(helmet());        // Enable Helmet for security
app.use(express.json());  // Parse JSON bodies
app.use(morgan('combined')); // or 'dev' for concise output


// Test route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/poll', pollRoutes);

// Simple Prometheus metrics
const metrics = {
  requests_total: {}
};

app.use((req, res, next) => {
  const route = req.route ? req.route.path : req.path;
  const method = req.method;

  const key = `${method}|${route}`;
  metrics.requests_total[key] = (metrics.requests_total[key] || 0) + 1;

  next();
});


app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  let response = '# HELP requests_total Total HTTP requests\n';
  response += '# TYPE requests_total counter\n';

  for (const key in metrics.requests_total) {
    const [method, route] = key.split('|');
    const count = metrics.requests_total[key];
    response += `requests_total{method="${method}",route="${route}"} ${count}\n`;
  }

  res.send(response);
});


// socket io
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // adjust to your frontend origin for security
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (pollId) => {
    console.log(`Socket ${socket.id} joining room poll/${pollId}`);
    socket.join(`poll/${pollId}`);
  }); 

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes if needed
app.set('io', io);

// Start server (replace app.listen with server.listen)
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


module.exports = app;
