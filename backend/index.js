const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./firebase')
require('dotenv').config();

const clientRoutes = require('./routes/clientRoutes');
const staffRoutes = require('./routes/staffRoutes');
const gymRoutes = require('./routes/gymRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const salaryRoutes = require('./routes/salaryRoutes')
const financeRoutes = require('./routes/financeRoutes')


const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gym-id'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '3mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use('/api/clients', clientRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/finance', financeRoutes);

// Apply multer to gym routes for file handling
app.use('/api/gym', upload.fields([
  { name: 'gymLogo', maxCount: 1 },
  { name: 'registrationDoc', maxCount: 1 },
  { name: 'govtIdDoc', maxCount: 1 }
]), gymRoutes);

app.use('/api/memberships', membershipRoutes);
app.use('/api/salary', salaryRoutes);


// Add login and checkAuth routes
const gymController = require('./controller/gymController');
app.post('/api/gym/login', gymController.loginGym);
app.post('/api/gym/me/:id', gymController.checkAuth);





app.get('/', (req, res) => {
  res.send('CyberGym API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));