import mongoose, { Schema } from 'mongoose';

const carSchema:Schema = new Schema({
ID: {
type: Number,
},
Name: {
type: String,
},
Make: {
type: String,
},
Range: {
type: Number,
},
Connector: [{
Type: {
type: String,
}
}],
}, {_id: false});

export default mongoose.model('Cars', carSchema)