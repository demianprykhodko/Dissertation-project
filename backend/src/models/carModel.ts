import mongoose, { Schema } from 'mongoose';

// Car schema
const carSchema:Schema = new Schema({
ID: {
type: Number, // Unique ID for the car
},
Name: {
type: String, // Brand name of the car
},
Make: {
type: String, // Model of the car
},
Range: {
type: Number, // Range of the car
},
Connector: [{ // Array of connectors
Type: {
type: String, // Type of the connector
}
}],
}, {_id: false});

export default mongoose.model('Cars', carSchema)