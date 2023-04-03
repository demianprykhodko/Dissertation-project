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
      type: String,
    },
    reserved: {
        type: String,
    },
    localId: {
        type: String,
    }
    
  }],
});
  
export default mongoose.model('Queues', queueSchema)