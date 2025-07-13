const cors = require('cors');

const corsOptions = {
  origin: '*', // Adjust as needed for production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions); 