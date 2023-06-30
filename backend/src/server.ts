import express, { Request, Response, NextFunction } from 'express';

const triggerRequestsRouter = require('./routes/test/trigger-requests/trigger-requests-route')
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Navigate to http://localhost:${port}/`)
});