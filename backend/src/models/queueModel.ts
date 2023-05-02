import mongoose, { Schema } from 'mongoose';

// Queue schema
const queueSchema:Schema = new Schema({
  id: {
    type: String, // Unique ID for the queue
  },
  empty: {
    type: Boolean, // Is the queue empty
  },
  entity: [{ // Array of entities in the queue
    car: {
      type: String, // Car user selected to enter the queue
    },
    time: { // Time user want to spend on the charger
        hours: {
            type: Number, // Hours
        },
        minutes: {
            type: Number, // Minutes
        },
    },
    place: {
      type: Number, // Place in the queue
    },
    reserved: {
        type: Boolean, // Is the place reserved
    },
    localId: {
        type: String, // Local ID of the entity
    },
    reserveEnd: {
      type: Date, // Time when the reservation ends
    },
    timeEnd: {
      type: Date, // Time when the charging ends
    }
  }],
});
  
export default mongoose.model('Queues', queueSchema)