import { Injectable } from '@angular/core';
import { EV_charger } from '../assets/models/ev_charger';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { allChargers, allQueue, cars, oneQueue, postQueue, deleteQueue, deleteAllQueue, allChargersCoords } from '../assets/constants/urls';
import { CarModel } from '../assets/models/carModel';
import { queue } from '../assets/models/queue';

@Injectable({
  providedIn: 'root'
})
export class ChargersService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<EV_charger[]> {
    return this.http.get<EV_charger[]>(allChargers);
  }

  getAllChargerCoords() : Observable<any> {
    return this.http.get<any>(allChargersCoords)
  }

  getAllCars(): Observable<CarModel[]> {
    return this.http.get<CarModel[]>(cars)
  }

  getAllQueue(): Observable<queue[]> {
    return this.http.get<queue[]>(allQueue)
  }

  getOneQueue(id): Observable<queue> {
    return this.http.get<queue>(oneQueue + id)
  }

  postQueue(queue: queue): Observable<any> {
    return this.http.post(postQueue, queue);
  }

  deleteQueue(id): Observable<any> {
    return this.http.delete(deleteQueue + id);
  }

  deleteAllQueue(): Observable<any> {
    return this.http.delete(deleteAllQueue);
  }
}
