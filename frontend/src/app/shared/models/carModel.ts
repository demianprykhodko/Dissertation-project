export class CarModel{
  _id!: string;
  Name!: string;
  Make!: string;
  Range!: number;
  Connector!: Connector;
}

export class Connector{
  Type!: string;
}
