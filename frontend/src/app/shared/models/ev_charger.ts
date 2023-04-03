export class EV_charger{
  _id!: string;
  ChargeDeviceId!: string;
  ChargeDeviceLatitude!: string;
  ChargeDeviceLongitude!: string;
  ChargeDeviceName?: string;
  Connector?: Array<Connector>;
  PaymentRequiredFlag?: boolean;
  ParkingFeesFlag?: boolean;
  Accessible24Hours?: boolean;
}

export class Connector{
  ConnectorType?: string;
  RatedOutputkW?: string;
  ChargePointStatus?: string;
}
