const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const seatRoutes = require('./routes/seatRoutes');
const { initializeSeats } = require('./models/seatModel');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Initialize seats when server starts
initializeSeats();

// Routes
app.use('/api/seats', seatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Ticket Booking System is running',
        timestamp: new Date().toISOString()
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to Concurrent Ticket Booking System API',
        version: '1.0.0',
        endpoints: {
            'GET /api/seats': 'View all seats with their current status',
            'POST /api/seats/:seatId/lock': 'Lock a seat temporarily (requires userId in body)',
            'POST /api/seats/:seatId/confirm': 'Confirm booking for a locked seat (requires userId in body)',
            'POST /api/seats/:seatId/release': 'Release a locked seat (requires userId in body)',
            'GET /api/seats/user/:userId': 'Get all seats locked/booked by a user',
            'GET /health': 'Health check endpoint'
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Ticket Booking System running on port ${PORT}`);
    console.log(`📱 Access API at: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
