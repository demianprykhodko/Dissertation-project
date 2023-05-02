import { } from 'googlemaps';
import { Component, NgZone, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { EV_charger, Connector } from 'src/app/assets/models/chargerModel';
import { ChargersService } from 'src/app/services/chargers.service';
import { DecodePolylineService } from 'src/app/services/decodePolyline.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, concatMap, map, tap } from 'rxjs';
import { CarModel } from 'src/app/assets/models/carModel';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { queue, place } from 'src/app/assets/models/queueModel';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('map', { static: true }) mapElement: any;
  map: google.maps.Map;
  chargers: EV_charger[];
  cars: CarModel[];
  selectedCar: CarModel[];
  carMake: any;
  carModel: any;
  carModelSelect: any;
  range: number;
  chargeAtStart: number = 100;
  chargeAtStop: number = 20;
  locationRange: number = 2000
  locationSection: boolean = false;
  routeSection: boolean = false;
  infoSection: boolean = false;
  chargerChosen: EV_charger;
  connectorsChosen: Connector[];
  fromLocation: string;
  timeToStay: number = 1800;
  toLocation: string;
  options: any = { types: ["(cities)"], componentRestrictions: { country: "uk" }, };
  zone: NgZone;
  directionsDisplay: any;
  directionsService: any;
  calculatedChargers: EV_charger[] = [];
  markers: any = [];
  circles: any = []
  listeners: any = [];
  queueSection: boolean = false;
  test: number = 1;
  markerCluster: any;
  queue: queue[] = [];
  ourQueue: queue;
  ourEntity: place;
  timeLeft: number = 60;
  time: number;
  mennekes: number =0;
  ccs: number=0;
  jevs: number = 0;
  done: number = 0;
  link: string;
  showError: boolean;
  hours: number;
  minutes: number;
  Interval: any;
  getAllAlg: boolean = false;

  constructor(private chargerService: ChargersService, private activatedRoute: ActivatedRoute, private decodePolylineService: DecodePolylineService, zone: NgZone) {
    this.zone = zone; // Create a new zone instance
    let chargersObservable: Observable<EV_charger[]>;
    chargersObservable = this.chargerService.getAll(); // Get all the chargers
    chargersObservable.subscribe((serverChargers) => {
      this.chargers = serverChargers;
    })
    let carsObservable: Observable<CarModel[]>;
    carsObservable = this.chargerService.getAllCars(); // Get all the cars
    carsObservable.subscribe((serverCars) => {
      this.cars = serverCars;
    })
    let queuesObservable: Observable<queue[]>;
    queuesObservable = this.chargerService.getAllQueue(); // Get all the queues
    queuesObservable.subscribe((serverQueues) => {
      this.queue = serverQueues;
    })
    let testObservable: Observable<any>;
    testObservable = this.chargerService.getAllChargerCoords(); // Get all the queues
    testObservable.subscribe((coords) => {
      console.log(coords)
    })
  }


  ngOnInit() {
    const mapProperties = { // Set the map properties
      center: new google.maps.LatLng(53.564163, -3.363110),
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties); // Create the map

    this.directionsDisplay = new google.maps.DirectionsRenderer(); // Create the directions renderer
    this.directionsService = new google.maps.DirectionsService(); // Create the directions service

    this.markerCluster = new MarkerClusterer({ // Create the marker clusterer
      map: this.map,
      markers: []
    })
  }

  showLocationSection() {
    this.directionsDisplay.setMap(null)
    this.clearOverlays()
    this.markerCluster.setMap(null);
    this.calculatedChargers = [];
    this.fromLocation = null;
    this.toLocation = null;
    this.locationSection = true;
    this.routeSection = false;
    this.done = 0;
    this.getAllAlg = false;
    this.queueSection = false;
  }

  showRouteSection() {
    this.clearOverlays()
    this.routeSection = true;
    this.locationSection = false;
    this.queueSection = false;
    this.markerCluster.setMap(null);
    this.done = 0;
    this.getAllAlg = false;

    let input1 = document.getElementById('input1'); // Get the input1 element from the DOM
    let autocomplete1 = new google.maps.places.Autocomplete(input1 as HTMLInputElement, this.options)
    google.maps.event.addListener(autocomplete1, 'place_changed', () => { // Each time you select place, fire the event
      this.zone.run(() => {
        this.fromLocation = autocomplete1.getPlace().name; // Get the place name
      });
    });
    let input2 = document.getElementById('input2'); // Get the input2 from the DOM
    let autocomplete2 = new google.maps.places.Autocomplete(input2 as HTMLInputElement, this.options)
    google.maps.event.addListener(autocomplete2, 'place_changed', () => { // Each time you select place, fire the event
      this.zone.run(() => {
        this.toLocation = autocomplete2.getPlace().name; // Get the place name
      });
    });
  }

  showCarMake() {
    this.carModel = this.cars.filter(e => e.Make == this.carMake); // Filter the cars by the brand
  }

  showCar() {
    this.selectedCar = this.cars.filter(e => e.Make == this.carMake && e.Name == this.carModelSelect); // Filter the cars by the brand and model
  }

  getLocation() {
    this.clearOverlays();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.map.setCenter(pos);
        this.map.setZoom(12);
        this.markerCluster.setMap(this.map);
        let locationCircle = new google.maps.Circle({
          center: pos,
          strokeColor: "#FF0000",
          strokeOpacity: 1,
          strokeWeight: 1,
          fillColor: "#FF0000",
          fillOpacity: 0,
          map: this.map,
          radius: this.locationRange,
        });
        this.circles.push(locationCircle);
        var radius = locationCircle.getRadius();
        var center = locationCircle.getCenter();
        for (let index = 0; index < this.chargers.length; index++) {
          let lat = parseFloat(this.chargers[index].ChargeDeviceLatitude);
          let lng = parseFloat(this.chargers[index].ChargeDeviceLongitude);
          let point = new google.maps.LatLng(lat, lng);
          if (
            google.maps.geometry.spherical.computeDistanceBetween(
              point,
              center
            ) <= radius
          ) {
            let marker = new google.maps.Marker({
              position: new google.maps.LatLng(lat, lng),
            });

            this.markers.push(marker);
            this.markerCluster.addMarker(marker);

            marker.addListener(
              "click",
              () => {
                this.ourQueue = null;
                this.queueSection = true
                this.chargerChosen = this.chargers[index];

                this.calculateChargerTypes();

                for (let index = 0; index < this.queue.length; index++) {
                  const element = this.queue[index];
                  if (element.id === this.chargerChosen.ChargeDeviceId) {
                    this.ourQueue = this.queue[index];
                  }
                }
              });
          }
        }
      })
    }
    else {
      console.log('Geolocation was not found')
    }
  }

  reloadPage() {
    window.location.reload();
  }

  // Calculate the number of chargers of each type
  calculateChargerTypes() {
    this.mennekes = 0;
    this.ccs = 0;
    this.jevs = 0;
    for (let index = 0; index < this.chargerChosen.Connector.length; index++) {
      const element = this.chargerChosen.Connector[index];
      if (element.ConnectorType.includes('Mennekes')) {
        this.mennekes+=1;
      }
      else if (element.ConnectorType.includes('CCS')) {
        this.ccs+=1;
      }
      else {
        this.jevs+=1;
      }
    }
  }

  // Seconds converted to hours and minutes
  secondsToHms(d) {
    d = Number(d);
    this.hours = Math.floor(d / 3600);
    this.minutes = Math.floor(d % 3600 / 60);
  }

  // Function that makes all the markers,circles and markercluster disappear, also reserts the arrays
  clearOverlays() {
    for (var i = 0; i < this.markers.length; i++ ) {
      this.markers[i].setMap(null);
    }
    for (var i = 0; i < this.circles.length; i++ ) {
      this.circles[i].setMap(null);
    }
    this.markerCluster.clearMarkers();
    this.markers.length = 0;
    this.circles.length = 0;
  }

  // Function that converts the date to the timezone
  convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));
  }

  // Function that adds minutes to the date
  addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
  }

  // Function that deletes all the queues and reloads the page
  deleteAllQueues() {
    this.chargerService.deleteAllQueue().subscribe((res) => {
      location.reload();
    });
  }

  // Function that adds new queues to the database if it is empty
  // Or adds a new car to the existing queue
  async addToQueue() {
    this.secondsToHms(this.timeToStay)
    const reservationEnd = this.addMinutes(new Date(), this.timeLeft / 60)

    if (!this.ourQueue) {
      this.ourEntity = {
        car: this.selectedCar[0].Name,
        time: {
          hours: this.hours,
          minutes: this.minutes,
        },
        place: 1,
        reserved: true,
        reserveEnd: reservationEnd,
      }

      this.ourQueue = {
        id: this.chargerChosen.ChargeDeviceId,
        empty: false,
        entity: [this.ourEntity]
      }
      this.queue.push(this.ourQueue)
      this.chargerService.postQueue(this.ourQueue)
      .subscribe(data => {})
      this.startReservation();
    }
    else{
      this.ourEntity = {
        car: this.selectedCar[0].Name,
        time: {
          hours: this.hours,
          minutes: this.minutes,
        },
        place: this.ourQueue.entity[this.ourQueue.entity.length - 1].place + 1,
        reserved: false,
        reserveEnd: reservationEnd,
      }
      const deleteQueue$ = this.chargerService.deleteQueue(this.ourQueue.id);
      const postQueue$ = deleteQueue$.pipe(
        tap(() => {
          this.ourQueue.entity.push(this.ourEntity);
        }),
        concatMap(() => {
          return this.chargerService.postQueue(this.ourQueue);
        })
      );
      postQueue$.subscribe({
        next: (data) => {
          if(data[0].entity[0].reserved == true) {
            this.waitForReservation();
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

  // For all the other cars in the queue, what time they should wait till the first car is done with the reservation
  waitForReservation() {

    const now = new Date().getTime()
    const waitUntil = this.convertTZ(this.ourQueue.entity[0].reserveEnd, 'Europe/London');
    waitUntil.setSeconds(waitUntil.getSeconds() + 10);

    const timeToWait = waitUntil.getTime() - now;

    setTimeout(() => {
      const getQueue$ = this.chargerService.getOneQueue(this.ourQueue.id).pipe(
        tap((data) => {
          this.ourQueue = data[0];
          if(this.ourQueue.entity[0].reserved == true && this.ourEntity.place == 2){
            this.ourEntity = this.ourQueue.entity[0];
            this.startReservation(); // If the first car no longer has a reservation, the second car can start
          }
          else{
            this.waitForCharging(); // If the first car now starts charging, the second car has to wait
          }

        })
      );

      getQueue$.subscribe({
        next: (data) => {
        },
        error: (error) => {
          console.error(error);
        }
      });
    }, timeToWait);
  }

  // For the other cars in the queue, what time they should wait till they can start charging
  waitForCharging() {
    const now = new Date().getTime()
    const waitUntil = this.convertTZ(this.ourQueue.entity[0].timeEnd, 'Europe/London');
    waitUntil.setSeconds(waitUntil.getSeconds() + 10);

    const timeToWait = waitUntil.getTime() - now;

    setTimeout(() => {
      const getQueue$ = this.chargerService.getOneQueue(this.ourQueue.id).pipe(
        tap((data) => {
          this.startReservation();
        })
      );

      getQueue$.subscribe({
        next: (data) => {
        },
        error: (error) => {
          console.error(error);
        }
      });
    }, timeToWait);

  }

  // Make a call to delete one queue
  deleteQueue() {
    this.chargerService.deleteQueue(this.ourQueue.id)
    .subscribe(data => {
      this.ourEntity = null;
      this.ourQueue = null;
    })
  }

  // Make a call to delete the top car from the queue entity
  deleteTop() {
    const getQueue$ = this.chargerService.getOneQueue(this.ourQueue.id).pipe(
      tap((data) => {
        this.ourQueue = data[0];
      })
    );

    const deleteQueue$ = getQueue$.pipe(
      concatMap((ourQueue) => {
        return this.chargerService.deleteQueue(this.ourQueue.id);
      })
    );

    const pushEntity$ = deleteQueue$.pipe(
      tap(() => {
        this.ourQueue.entity.shift();
        this.ourQueue.entity[0].reserved = true;
        for (let i = 0; i < this.ourQueue.entity.length; i++) {
          this.ourQueue.entity[i].place = this.ourQueue.entity[i].place - 1;
        }
      }),
      concatMap(() => {
        return this.chargerService.postQueue(this.ourQueue);
      })
    );

    pushEntity$.subscribe({
      next: (data) => {
        this.ourEntity = null;
        this.ourQueue = null;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  // Start the reservation timer
  startReservation() {
    this.Interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.Interval)
        this.timeLeft = 60;
        this.chargerService.getOneQueue(this.ourQueue.id)
          .subscribe(data => {
            if(data[0].entity[0].reserved == true && data[0].entity.length == 1) {
              this.deleteQueue()
            }
            else {
              this.deleteTop();
            }
            this.showError = true;
        })
      }
    },1000)
  }

  // Start the charging timer
  startCharging() {
    clearInterval(this.Interval)
    this.timeLeft = 60;
    this.ourEntity.reserved = false;
    this.ourEntity.reserveEnd = null;
    this.time = this.ourEntity.time.hours * 3600 + this.ourEntity.time.minutes * 60
    this.ourEntity.timeEnd = this.addMinutes(new Date(), this.time / 60);
    const getQueue$ = this.chargerService.getOneQueue(this.ourQueue.id).pipe(
      tap((data) => {
        this.ourQueue = data[0];
        this.ourQueue.entity[0] = this.ourEntity;
      })
    );
    const deleteQueue$ = getQueue$.pipe(
      concatMap((ourQueue) => {
        return this.chargerService.deleteQueue(this.ourQueue.id);
      })
    );

    const postEntity$ = deleteQueue$.pipe(
      concatMap(() => {
        return this.chargerService.postQueue(this.ourQueue);
      })
    );

    postEntity$.subscribe({
      next: () => {},
      error: (error) => {
        console.error(error);
      }
    });
    this.Interval = setInterval(() => {
      if(this.time > 0) {
        this.time--;
      } else {
        clearInterval(this.Interval)
        this.showError = true;
      }
    },1000)
  }

  // After finishing charging, delete the top car from the queue
  leaveCharger() {
    clearInterval(this.Interval)
    this.chargerService.getOneQueue(this.ourQueue.id)
          .subscribe(data => {
            if(data[0].entity.length == 1) {
              this.deleteQueue()
            }
            else {
              this.deleteTop();
            }
        })
  }

  // Create a link to google maps with all the stops at the chargers
  constructLink() {
    let link = "https://www.google.com/maps/dir/"
    this.link = link + this.fromLocation + "/"
    for (let index = 0; index < this.calculatedChargers.length; index++) {
      const element = this.calculatedChargers[index];
      this.link = this.link + element.ChargeDeviceLatitude + "," + element.ChargeDeviceLongitude + "/"
    }
    this.link = this.link + this.toLocation + "/"
  }


  // Get All chargers on route
  async getAllOnRoute() {
    this.infoSection = false;
    this.calculatedChargers = [];
    this.directionsDisplay.setMap(null)
    this.clearOverlays()


    this.directionsDisplay.setMap(this.map);
    var request = {
      origin: this.fromLocation,
      destination: this.toLocation,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      provideRouteAlternatives: true,
    };
    this.directionsService.route(request, (result, status) => {
      if (status == google.maps.DirectionsStatus.OK) {

        var points = this.decodePolylineService.decode(result.routes[0].overview_polyline);

        for (let j = 0; j < points.length; j += 10) {
          let circle = new google.maps.Circle({
            center: new google.maps.LatLng(
              points[j].latitude,
              points[j].longitude
            ),
            strokeColor: "#FF0000",
            strokeOpacity: 0,
            strokeWeight: 0,
            fillColor: "#FF0000",
            fillOpacity: 0,
            map: this.map,
            radius: 10000,
          });
          for (let index = 0; index < this.chargers.length; index++) {
            const lat = parseFloat(this.chargers[index].ChargeDeviceLatitude);
            const lng = parseFloat(this.chargers[index].ChargeDeviceLongitude);
            const point = new google.maps.LatLng(lat, lng);
            if (google.maps.geometry.spherical.computeDistanceBetween(point, circle.getCenter()) <= circle.getRadius()) {
              var marker = new google.maps.Marker({
                position: point,
                map: this.map,
              });
              this.markers.push(marker);
              var listener = marker.addListener(
                "click",
                () => {
                  this.infoSection = true;
                  this.getAllAlg = true;
                  this.chargerChosen = this.chargers[index];
                  this.calculateChargerTypes()
                });
              this.listeners.push(listener);
            }
          }
        }
        this.directionsDisplay.setDirections(result);
      }
    });
  }

  addToPath() {
    this.calculatedChargers.push(this.chargerChosen)
    this.done = 1;
    this.constructLink();
  }

  clearPath() {
    this.calculatedChargers = [];
  }

  getOptimalRouteCustom() {
    this.directionsDisplay.setMap(null)
    this.test = 1;
    this.done = 0;
    this.calculatedChargers = []
    this.clearOverlays()
    this.directionsDisplay.setMap(this.map);
    var request = {
      origin: this.fromLocation,
      destination: this.toLocation,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      provideRouteAlternatives: true,
    };
    let range = this.selectedCar[0].Range * (this.chargeAtStart / 100) * 1000;
    range = Math.floor(range - range * (this.chargeAtStop / 100));
    this.calculateRouteCustom(request, range);
  }

  getNextOptimalRouteCustom() {
    this.infoSection = false;
    this.listeners.forEach(function (item) {
      google.maps.event.removeListener(item);
    })

    this.calculatedChargers.push(this.chargerChosen)
    this.directionsDisplay.setMap(this.map);

    let coords = new google.maps.LatLng(
      parseFloat(this.chargerChosen.ChargeDeviceLatitude),
      parseFloat(this.chargerChosen.ChargeDeviceLongitude)
    )
    var request = {
      origin: coords, // Latitude and Longitude pair
      destination: this.toLocation, // Latitude and Longitude pair
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      provideRouteAlternatives: true,
    };
    let range = (this.selectedCar[0].Range - (this.chargeAtStop / 100)) * 1000;
    range = Math.floor(range - range * (this.chargeAtStop / 100));
    this.chargerChosen = {} as EV_charger;
    this.calculateRouteCustom(request, range);
  }

  calculateRouteCustom(request, range) {
    this.directionsService.route(request, (result, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        if (result.routes[0].legs[0].distance.value < range) {
          this.done = 1;
          this.constructLink();
        }

        let path_done = 0;
        let pathWhereChargerNeeded = 0;

        for (let i = 0; i < result.routes[0].legs[0].steps.length; i++) {
          let previous_path = path_done;

          path_done = path_done + result.routes[0].legs[0].steps[i].distance.value

          let j = 0; // index of the remaining path to the max range of the vehicle

          if (path_done > range) {
            pathWhereChargerNeeded = Math.abs((range - previous_path)) / result.routes[0].legs[0].steps[i].distance.value;
            j = Math.floor(pathWhereChargerNeeded * result.routes[0].legs[0].steps[i].path.length);
            this.getOptimalCustomChargers(result, i, j);
            path_done = path_done - range;
            break;
          }
        }
        if (this.test == 1) {
          this.directionsDisplay.setDirections(result);
          this.test = 0;
        }
      }
    })
  }

  getOptimalCustomChargers(result, i, j) {
    let chargers_counter = 0;
    let radiusOfSearch = 1000;
    while (chargers_counter <= 2) {
      let circle = new google.maps.Circle({
        center: new google.maps.LatLng(
          result.routes[0].legs[0].steps[i].path[j].lat(),
          result.routes[0].legs[0].steps[i].path[j].lng()
        ),
        strokeColor: "#FF0000",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#FF0000",
        fillOpacity: 0,
        map: this.map,
        radius: radiusOfSearch,
      });
      this.circles.push(circle);
      for (let index = 0; index < this.chargers.length; index++) {
        const lat = parseFloat(this.chargers[index].ChargeDeviceLatitude);
        const lng = parseFloat(this.chargers[index].ChargeDeviceLongitude);
        const point = new google.maps.LatLng(lat, lng);
        if (google.maps.geometry.spherical.computeDistanceBetween(point, circle.getCenter()) <= circle.getRadius()) {
          chargers_counter++;
          let marker = new google.maps.Marker({
            position: point,
            map: this.map,
          });
          this.markers.push(marker);
          var listener = marker.addListener(
            "click",
            () => {
              this.infoSection = true;
              this.chargerChosen = this.chargers[index];
              this.calculateChargerTypes()
            });
          this.listeners.push(listener);
        }
      }
      radiusOfSearch += 1000;
      if (chargers_counter <= 2) {
        chargers_counter = 0;
      }
    }
  }

  getOptimalRouteFast() {
    this.directionsDisplay.setMap(null);
    this.clearOverlays();
    this.directionsDisplay.setMap(this.map);
    this.calculatedChargers = []
    this.calculateOptimal();
  }

  calculateOptimal() {
    let range = this.selectedCar[0].Range * (this.chargeAtStart / 100) * 1000;
    range = Math.floor(range - range * (this.chargeAtStop / 100));

    var request = {
      origin: this.fromLocation,
      destination: this.toLocation,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      provideRouteAlternatives: true,
    };
    this.directionsService.route(request, (result, status) => {
      if (status == google.maps.DirectionsStatus.OK) {

        let path_done = 0;
        let pathWhereChargerNeeded = 0;

        for (let i = 0; i < result.routes[0].legs[0].steps.length; i++) {
          let previous_path = path_done;
          path_done = path_done + result.routes[0].legs[0].steps[i].distance.value
          let j = 0; // index of the remaining path to the max range of the vehicle

          if (path_done > range) {
            if (result.routes[0].legs[0].steps[i].distance.value < previous_path) {
              pathWhereChargerNeeded = (range - previous_path) / result.routes[0].legs[0].steps[i].distance.value;
              j = Math.floor(pathWhereChargerNeeded * result.routes[0].legs[0].steps[i].path.length);
              this.getOptimalChargers(result, i, j);
              path_done = path_done - range + 5000;
              range = Math.floor((this.selectedCar[0].Range - (this.chargeAtStop/100)) * 1000)
              range = Math.floor(range - range * (this.chargeAtStop / 100));
            }
            else {
              pathWhereChargerNeeded = (range - previous_path) / result.routes[0].legs[0].steps[i].distance.value;
              j = Math.floor(pathWhereChargerNeeded * result.routes[0].legs[0].steps[i].path.length);
              this.getOptimalChargers(result, i, j);
              path_done = path_done - range + 5000;
              range = Math.floor((this.selectedCar[0].Range - (this.chargeAtStop/100)) * 1000)
              range = Math.floor(range - range * (this.chargeAtStop / 100));
              if (path_done > range) {
                pathWhereChargerNeeded = range / path_done;
                j = Math.floor(pathWhereChargerNeeded * result.routes[0].legs[0].steps[i].path.length);
                this.getOptimalChargers(result, i, j);
                path_done = path_done - range;
                range = Math.floor((this.selectedCar[0].Range - (this.chargeAtStop/100)) * 1000)
                range = Math.floor(range - range * (this.chargeAtStop / 100));
              }
            }
          }
        };
        this.directionsDisplay.setDirections(result);
      }
    })
  }

  // Calculate which charger are close to the circle in the 'optimal' algorithm
  getOptimalChargers(result, i, j) {
    let chargers_counter = 0;                   // Set counter to 0
    let radiusOfSearch = 1000;                  // Set radius of search to 1000m
    while (chargers_counter == 0) {             // Continue to increase the radius of search until at least 1 charger is found
      let circle = new google.maps.Circle({     // Create a circle with the radius of search to demonstrate the area of search
        center: new google.maps.LatLng(
          result.routes[0].legs[0].steps[i].path[j].lat(),
          result.routes[0].legs[0].steps[i].path[j].lng()
        ),
        strokeColor: "#FF0000",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#FF0000",
        fillOpacity: 0,
        map: this.map,
        radius: radiusOfSearch,
      });
      this.circles.push(circle);                                   // As we reuse the same map, we need to keep track of the circles to remove them later
      for (let index = 0; index < this.chargers.length; index++) { // Loop through all the chargers
        const lat = parseFloat(this.chargers[index].ChargeDeviceLatitude);
        const lng = parseFloat(this.chargers[index].ChargeDeviceLongitude);
        const point = new google.maps.LatLng(lat, lng);
        if (google.maps.geometry.spherical.computeDistanceBetween(point, circle.getCenter()) <= circle.getRadius()) { // Find the chargers that are within the circle
          chargers_counter += 1;
          let marker = new google.maps.Marker({                     // Create a marker for the charger
            position: point,
            map: this.map,
          });
          this.markers.push(marker);                               // As we reuse the same map, we need to keep track of the markers to remove them later
          this.calculatedChargers.push(this.chargers[index]);      // Add charger to the array of stops to make
          break;
        }
      }
      radiusOfSearch += 1000;
    }
    this.done = 1;                                                // Set done to 1 to indicate that the chargers have been found
    this.constructLink();                                         // Construct the link to the google maps page
  }
}
