import mongoose, { Schema } from 'mongoose';

// Charger schema
const chargerSchema:Schema = new Schema({
  ChargeDeviceId: {
    type: String, // Unique ID for the charger
  },
  ChargeDeviceLatitude: {
    type: String, // Latitude of the charger
  },
  ChargeDeviceLongitude: {
    type: String, // Longitude of the charger
  },
  ChargeDeviceName: {
    type: String, // Name of the charger
  },
  Connector: [{ // Array of connectors
    ConnectorType: {
      type: String, // Type of the connector
    },
    RatedOutputkW: {
      type: String, // Rated output of the connector
    },
    ChargePointStatus: {
      type: String, // Status of the connector
    },
  }],
  PaymentRequiredFlag: {
    type: Boolean, // Is payment required
  },
  ParkingFeesFlag: {
    type: Boolean, // Is parking fee required
  },
  Accessible24Hours: {
    type: Boolean, // Is the charger accessible 24/7
  },
});
  
export default mongoose.model('Chargers', chargerSchema)