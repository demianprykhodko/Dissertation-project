import { Injectable } from '@angular/core';
import { EV_charger } from '../assets/models/chargerModel';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { allChargers, allQueue, cars, oneQueue, postQueue, deleteQueue, deleteAllQueue, allChargersCoords } from '../assets/constants/urls';
import { CarModel } from '../assets/models/carModel';
import { queue } from '../assets/models/queueModel';

@Injectable({
  providedIn: 'root'
})

// This service is used to make the HTTP requests to the API
export class ChargersService {

  constructor(private http: HttpClient) { }

  // Get all the chargers
  getAll(): Observable<EV_charger[]> {
    return this.http.get<EV_charger[]>(allChargers);
  }

  // Get all the chargers coordinates
  getAllChargerCoords() : Observable<any> {
    return this.http.get<any>(allChargersCoords)
  }

  // Get all the cars
  getAllCars(): Observable<CarModel[]> {
    return this.http.get<CarModel[]>(cars)
  }

  // Get all the queue
  getAllQueue(): Observable<queue[]> {
    return this.http.get<queue[]>(allQueue)
  }

  // Get one queue
  getOneQueue(id): Observable<queue> {
    return this.http.get<queue>(oneQueue + id)
  }

  // Post a queue
  postQueue(queue: queue): Observable<any> {
    return this.http.post(postQueue, queue);
  }

  // Delete a queue
  deleteQueue(id): Observable<any> {
    return this.http.delete(deleteQueue + id);
  }

  // Delete all the queues
  deleteAllQueue(): Observable<any> {
    return this.http.delete(deleteAllQueue);
  }
}
