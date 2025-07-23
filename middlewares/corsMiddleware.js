const cors = require('cors');

/**
 * @type {cors.CorsOptions}
 */
const corsOptions = {
    origin: process.env.NODE_ENV === "development" ?
        "*" : [...process.env.FRONTEND_URL.split(",")],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: "600"
};

console.log(process.env.NODE_ENV)
module.exports = cors(corsOptions);