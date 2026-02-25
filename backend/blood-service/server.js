const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/config/db');



const db = require('./src/config/db');

const bloodRoutes = require('./src/routes/bloodRoutes');
const bloodRequestRoutes = require('./src/routes/bloodRequestRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(cors());


// app.use('/api/blood', bloodRoutes);
// app.use('/api/blood-requests', bloodRequestRoutes);

app.use('/api/blood/v1', bloodRoutes);
app.use('/api/blood/blood-requests', bloodRequestRoutes);

// Initialize database and start server
(async () => {
  try {
    await sequelize.authenticate();
     console.log('Database connected');

    await sequelize.sync();
    console.log('Database synced');
    
    console.log('Loaded models:', Object.keys(sequelize.models));

    app.listen(PORT, () => {
      console.log(`Blood Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
})();


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map(e => e.message) });
  }
  res.status(500).json({ error: 'Something went wrong!' });
});
