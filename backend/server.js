const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Database connection
const connectDB = require('./config/db');
connectDB();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server error' });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html for non-API routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});