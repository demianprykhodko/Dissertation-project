import Chargers from '../models/model';
import Cars from '../models/carModel';
import Queue from '../models/queue';

class User {

    public async getAllChargers(req: any, res: any) {
        const chargers = await Chargers.find({});
        res.json(chargers);
    };

    public async getAllChargersCoordinates(req: any, res: any) {
        const chargers = await Chargers.aggregate([
            { $project : { _id : 0, ChargeDeviceId: 1, coordinates : [ "$ChargeDeviceLatitude", "$ChargeDeviceLongitude"] } }
        ]);
        res.json(chargers);
    };

    public async getAllCars(req: any, res: any) {
        const cars = await Cars.find({});
        res.json(cars);
    };

    public async getAllQueue(req: any, res: any) {
        const queue = await Queue.find({});
        res.json(queue);
    };

    public async getOneQueue(req: any, res: any) {
        var queueId = req.params.queueId;
        const queue = await Queue.find({
            id: queueId
        });
        res.json(queue);
    };

    public async postQueue(req: any, res: any) {
        var body = req.body;
        console.log(body)
        const queue = await Queue.insertMany(body);
        res.json(queue);
    }

    public async deleteQueue(req: any, res: any) {
        var queueId = req.params.queueId;
        const queue = await Queue.deleteOne({
            id: queueId
        });
        res.json(queue);
    };

    public async deleteAllQueue(req: any, res: any) {
        const queue = await Queue.deleteMany({});
        res.json(queue);
    };

    public async updateQueue(req: any, res: any) {
        var body = req.body;
        const queue = await Queue.findOneAndReplace(req.params.queueId,body);
        res.json(queue);
    };
    
}

const user = new User()
export default user;
