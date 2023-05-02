import Chargers from '../models/chargerModel';
import Cars from '../models/carModel';
import Queue from '../models/queueModel';

class DbContext {

    // Get all chargers from the database
    public async getAllChargers(req: any, res: any) {
        const chargers = await Chargers.find({});
        res.json(chargers); // Return the chargers as JSON
    };

    // Get all the coordinates of the chargers from the database
    public async getAllChargersCoordinates(req: any, res: any) {
        const chargers = await Chargers.aggregate([ // Aggregate the chargers
            { 
                $project : { // Project the ChargeDeviceId and the coordinates
                    _id : 0, 
                    ChargeDeviceId: 1, 
                    coordinates : [ "$ChargeDeviceLatitude", "$ChargeDeviceLongitude"] 
                } 
            }
        ]);
        res.json(chargers); // Return the chargers as JSON
    };

    // Get all the cars from the database
    public async getAllCars(req: any, res: any) {
        const cars = await Cars.find({});
        res.json(cars); // Return the cars as JSON
    };

    // Get all the queues from the database
    public async getAllQueue(req: any, res: any) {
        const queue = await Queue.find({});
        res.json(queue); // Return the queues as JSON
    };

    // Get one queue from the database by Id
    public async getOneQueue(req: any, res: any) {
        var queueId = req.params.queueId;
        const queue = await Queue.find({ 
            id: queueId
        });
        res.json(queue);
    };

    // Post a queue to the database
    public async postQueue(req: any, res: any) {
        var body = req.body;
        console.log(body)
        const queue = await Queue.insertMany(body);
        res.json(queue);
    }

    // Delete a queue from the database by Id
    public async deleteQueue(req: any, res: any) {
        var queueId = req.params.queueId;
        const queue = await Queue.deleteOne({
            id: queueId
        });
        res.json(queue);
    };

    // Delete all queues from the database
    public async deleteAllQueue(req: any, res: any) {
        const queue = await Queue.deleteMany({});
        res.json(queue);
    };

    // Update a queue from the database by Id
    public async updateQueue(req: any, res: any) {
        var body = req.body;
        const queue = await Queue.findOneAndReplace(req.params.queueId,body);
        res.json(queue);
    };
    
}

const dbContext = new DbContext() // Create a new instance of the DbContext class
export default dbContext; // Export the DbContext class
