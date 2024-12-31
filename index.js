const express = require('express');
const app = express();
require('dotenv').config();
const connection = require('./database/db');
const adminRouter = require('./routes/adminRoutes');
const movieRouter = require('./routes/movieRoutes');
const cors = require('cors');
const cookieParser = require("cookie-parser");

//database connection
connection();

//middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser())


//routes
app.use('/api/admin', adminRouter);
app.use('/api/movie', movieRouter);

//port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});