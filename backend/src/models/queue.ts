import mongoose, { Schema } from 'mongoose';

const queueSchema:Schema = new Schema({
  id: {
    type: String,
  },
  empty: {
    type: Boolean,
  },
  entity: [{
    car: {
      type: String,
    },
    time: {
        hours: {
            type: Number,
        },
        minutes: {
            type: Number,
        },
    },
    place: {
      type: Number,
    },
    reserved: {
        type: Boolean,
    },
    localId: {
        type: String,
    },
    reserveEnd: {
      type: Date,
    },
    timeEnd: {
      type: Date,
    }
  }],
});
  
export default mongoose.model('Queues', queueSchema)