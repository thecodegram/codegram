import express, {Request, Response} from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import session from 'express-session'
import { enforceLoggedIn } from './utils/middleware';

const triggerRequestsRouter = require('./routes/test/trigger-requests-route')
const usersRouter = require('./routes/users/users-route')
const authRouter = require('./routes/auth-route')
const cors = require('cors');

// Create an Express.js app
const app = express();
const port = 8080;

// environment variables
dotenv.config();

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// Other routes and middleware

// Custom middleware to set the necessary headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});


// Session middleware for the entire application
app.use(session({
  name: 'mysession',
  secret: process.env.AUTH_SECRET_KEY!!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000 // 1 hour in milliseconds
  }
}));

app.use('/api/trigger-requests', [enforceLoggedIn], triggerRequestsRouter)
app.use('/api/user', [enforceLoggedIn], usersRouter)
app.use('/api/auth', authRouter)

// TODO: remove 
app.get('/login', (req, res) => {
  res.send("Logged in!");
});


app.get('/api/protected', [enforceLoggedIn], (req: Request, res: Response) => {
  res.send("Accessing protected endpoint");
})




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
