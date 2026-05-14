require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
// app.use(helmet()); 

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

// app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/calories', require('./routes/calorieRoutes'));
app.use('/api/sleep', require('./routes/sleepRoutes'));
app.use('/api/water', require('./routes/waterRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Magic Seed Route - To fix the 0s issue
app.post('/api/seed-my-data', require('./middleware/auth').protect, async (req, res) => {
  try {
    const Workout = require('./models/Workout');
    const Calorie = require('./models/Calorie');
    const Sleep = require('./models/Sleep');
    const Water = require('./models/Water');
    const userId = req.user._id;

    console.log(`[SEED] Generating data for user: ${req.user.email}`);

    // Clear existing
    await Promise.all([
      Workout.deleteMany({ user: userId }),
      Calorie.deleteMany({ user: userId }),
      Sleep.deleteMany({ user: userId }),
      Water.deleteMany({ user: userId }),
    ]);

    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      await Workout.create({ user: userId, type: 'running', duration: 45, caloriesBurned: 400, date });
      await Calorie.create({ user: userId, foodName: 'Balanced Meal', calories: 750, protein: 35, carbs: 70, fat: 20, mealType: 'lunch', date });
      await Sleep.create({ user: userId, sleepTime: '22:00', wakeTime: '06:00', duration: 8, quality: 'good', date });
      await Water.create({ user: userId, amount: 2500, date });
    }

    res.json({ success: true, message: 'Data generated!' });
  } catch (error) {
    console.error('[SEED] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check route
app.get('/api/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Aura Health API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Production setup
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(
      path.resolve(__dirname, '../client/dist', 'index.html')
    );
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Aura Health Server running on port ${PORT} in ${
      process.env.NODE_ENV || 'development'
    } mode`
  );
});