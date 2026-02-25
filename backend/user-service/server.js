require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/db.js');

const roleRoutes = require("./src/routes/roleRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const donorRoutes = require("./src/routes/donorRoutes");
const eventOrganisorRoutes = require("./src/routes/eventOrganisorRoutes");
const genderRoutes = require("./src/routes/genderRoutes");
const authRoutes = require("./src/routes/authRoutes.js");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Verify Database Connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    // Sync models with the database
    return sequelize.sync({ force: false }); // Set to true only for development to drop and recreate tables
  })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch(err => {
    console.error('Database connection or sync error:', err);
    process.exit(1); // Exit if connection or sync fails
  });

// Routes
app.use("/api/users/donor", donorRoutes);
app.use("/api/users/eventOrganisor", eventOrganisorRoutes);
app.use("/api/users/gender", genderRoutes);
app.use("/api/users/roles", roleRoutes);
app.use("/api/users/admin", adminRoutes);
app.use("/api/users/auth", authRoutes);

// 404 Error Handler
app.use((req, res) => {
  console.log(`404 Error - Requested URL: ${req.originalUrl}`);
  res.status(404).send('Not Found');
});

// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`${process.env.SERVICE_NAME} Service running on port ${PORT}`));