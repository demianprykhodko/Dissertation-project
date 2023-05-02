import cors from 'cors';
import express from 'express';
import dbContext from './controllers/main'
import * as bodyParser from 'body-parser';
import { connectToDatabase } from './db/connect';
require('dotenv').config({ path: '../.env' });

const app = express() // Create an instance of the express class

app.use(bodyParser.json()); // Use the body-parser middleware

// Allow the frontend to connect to the backend
app.use(cors({
    credentials: true, 
    origin: ['http://localhost:4200']
}))

// Create a router for the API
const router = express.Router();

app.use('/api/v1', router);

// Create the routes for the API
router.get('/data', dbContext.getAllChargers);
router.get('/data/coords', dbContext.getAllChargersCoordinates);
router.get('/cars', dbContext.getAllCars);
router.get('/queue', dbContext.getAllQueue);
router.get('/queue/:queueId', dbContext.getOneQueue);
router.post('/queue', dbContext.postQueue);
router.delete('/queue/:queueId', dbContext.deleteQueue);
router.delete('/queue', dbContext.deleteAllQueue);
router.put('/queue/:queueId', dbContext.updateQueue);

const port = process.env.PORT;

// Start the server on specific port and with a connection to the database
app.listen(port, () => {
    connectToDatabase(process.env.MONGO_URI);
    console.log(`Server running on port ${port}`);
})