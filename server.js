require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eglisemanager', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB connecté');
}).catch(err => {
    console.log('❌ Erreur MongoDB:', err);
});

// Import Routes
const licenseRoutes = require('./routes/license');
const paymentRoutes = require('./routes/payment');
const backupRoutes = require('./routes/backup');
const messageRoutes = require('./routes/messages');
const meetingRoutes = require('./routes/meetings');

// Routes
app.use('/api/license', licenseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meetings', meetingRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'EgliseManager API v1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: err.message 
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur EgliseManager démarré sur le port ${PORT}`);
    console.log(`📍 API disponible à http://localhost:${PORT}/api`);
});

module.exports = app;
