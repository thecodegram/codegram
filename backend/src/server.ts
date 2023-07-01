import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'

const triggerRequestsRouter = require('./routes/test/trigger-requests-route')
const usersRouter = require('./routes/users/users-route')

// Create an Express.js app
const app = express();
const port = 8080;

// Request logging
app.use('/', (req, _, next) => {
  console.log(`${req.method} for ${req.url} with body ${JSON.stringify(req.body)}`);
  next();
})

app.use('/api/trigger-requests', triggerRequestsRouter)
app.use('/api/addUser', usersRouter)


// environment variables
dotenv.config();

const DB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING!!;
console.log(DB_CONNECTION_STRING, {});
// mongoose.set('strictQuery', false);

async function startServer() {
  try {
    await mongoose.connect(DB_CONNECTION_STRING, {
      maxConnecting: 30
    });
    console.log('Connected to MongoDB');

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Navigate to http://localhost:${port}/`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

startServer();
