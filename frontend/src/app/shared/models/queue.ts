import { Time } from "@angular/common";

export class queue{
  id!: string;
  empty: boolean;
  entity!: Array<place>;
}

export class place{
  car!: string;
  time!: Time;
  place!: number;
  reserved!: boolean;
  localId!: Number;
}
