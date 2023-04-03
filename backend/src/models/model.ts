import mongoose, { Schema } from 'mongoose';

const chargerSchema:Schema = new Schema({
  ChargeDeviceId: {
    type: String,
  },
  ChargeDeviceLatitude: {
    type: String,
  },
  ChargeDeviceLongitude: {
    type: String,
  },
  ChargeDeviceName: {
    type: String,
  },
  Connector: [{
    ConnectorType: {
      type: String,
    },
    RatedOutputkW: {
      type: String,
    },
    ChargePointStatus: {
      type: String,
    },
  }],
  PaymentRequiredFlag: {
    type: Boolean,
  },
  ParkingFeesFlag: {
    type: Boolean,
  },
  Accessible24Hours: {
    type: Boolean,
  },
});
  
export default mongoose.model('Chargers', chargerSchema)