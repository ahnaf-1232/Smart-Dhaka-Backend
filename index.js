require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
// app.use('/emergency', require('./routes/emergency'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/voting', require('./routes/votingRoutes'));
app.use('/api/ideas', require('./routes/ideaRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use("/api/feedbacks", require("./routes/feedbackRoutes"));
// app.use('/utilities', require('./routes/utilities'));
// app.use('/community', require('./routes/community'));
// app.use('/transport', require('./routes/transport'));
// app.use('/notifications', require('./routes/notifications'));
// app.use('/rewards', require('./routes/rewards'));
// app.use('/admin', require('./routes/admin'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));