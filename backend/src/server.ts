import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
require('dotenv').config({ path: '../.env' });
import User from './controllers/main'
import { connectToDatabase } from './db/connect';
const app = express()

app.use(bodyParser.json());

app.use(cors({
    credentials: true,
    origin: ['http://localhost:4200']
}))

const router = express.Router();

// app.use('', (req, res) => {
//     res.send('APi working')
// })

app.use('/api/v1', router);

router.get('/data', User.getAllChargers);
router.get('/cars', User.getAllCars);
router.get('/queue', User.getAllQueue);
router.get('/queue/:queueId', User.getOneQueue);
router.post('/queue', User.postQueue);
router.delete('/queue/:queueId', User.deleteQueue);

const port = process.env.PORT;

app.listen(port, () => {
    connectToDatabase(process.env.MONGO_URI);
    console.log(`Server running on ${port}`);
})