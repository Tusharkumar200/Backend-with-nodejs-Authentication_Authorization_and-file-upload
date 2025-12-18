require('dotenv').config();

const express = require('express');

const connectDB = require('./database/db');
const authRoutes = require('./routes/auth-routes');
const home = require('./routes/home-routes');
const admin = require('./routes/admin-routes');
const uploadImageRoutes = require('./routes/image-routes');

const PORT = process.env.SERVER_PORT || 8080;

const app = express();
connectDB();

// MiddleWare

app.use(express.json());  // Because we are using the data from the req.body

app.use("/api/auth", authRoutes);
app.use("/api/home",home);
app.use("/api/admin",admin);
app.use("/api/image",uploadImageRoutes);


app.listen(PORT,()=>{console.log(`Server is running on port ${PORT}`)})


 