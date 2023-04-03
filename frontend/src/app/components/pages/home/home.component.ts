import { } from 'googlemaps';
import { Component, ElementRef, Inject, Input, NgZone, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { EV_charger, Connector } from 'src/app/shared/models/ev_charger';
import { ChargersService } from 'src/app/services/chargers.service';
import { DecodePolylineService } from 'src/app/services/decodePolyline.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CarModel } from 'src/app/shared/models/carModel';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { queue, place } from 'src/app/shared/models/queue';


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
  carMake: any;
  carModel: any;
  carModelSelect: any;
  selectedCar: CarModel[];
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
  options: any = { types: ["(cities)"] };
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
  timeLeft: number = 120;
  time: number;
  mennekes: number =0;
  ccs: number=0;
  jevs: number = 0;
  done: number = 0;
  link: string;
  showError: number;
  hours: number;
  minutes: number;

  constructor(private chargerService: ChargersService, private activatedRoute: ActivatedRoute, private decodePolylineService: DecodePolylineService, zone: NgZone) {
    this.zone = zone;
    let chargersObservable: Observable<EV_charger[]>;
    chargersObservable = this.chargerService.getAll();
    chargersObservable.subscribe((serverChargers) => {
      this.chargers = serverChargers;
    })
    let carsObservable: Observable<CarModel[]>;
    carsObservable = this.chargerService.getAllCars();
    carsObservable.subscribe((serverCars) => {
      this.cars = serverCars;
    })
    let queuesObservable: Observable<queue[]>;
    queuesObservable = this.chargerService.getAllQueue();
    queuesObservable.subscribe((serverQueues) => {
      this.queue = serverQueues;
    })
  }


  ngOnInit() {
    const mapProperties = {
      center: new google.maps.LatLng(53.564163, -3.363110),
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.directionsService = new google.maps.DirectionsService();
    this.markerCluster = new MarkerClusterer({
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
  }

  showRouteSection() {
    this.clearOverlays()
    this.routeSection = true;
    this.locationSection = false;
    this.queueSection = false;
    this.markerCluster.setMap(null);
    this.done = 0;
    let input1 = document.getElementById('input1');
    let autocomplete1 = new google.maps.places.Autocomplete(input1 as HTMLInputElement, this.options)
    google.maps.event.addListener(autocomplete1, 'place_changed', () => {
      this.zone.run(() => {
        this.fromLocation = autocomplete1.getPlace().name;
      });
    });
    let input2 = document.getElementById('input2');
    let autocomplete2 = new google.maps.places.Autocomplete(input2 as HTMLInputElement, this.options)
    google.maps.event.addListener(autocomplete2, 'place_changed', () => {
      this.zone.run(() => {
        this.toLocation = autocomplete2.getPlace().name;
      });
    });
  }

  showCarMake() {
    this.carModel = this.cars.filter(e => e.Make == this.carMake);
  }

  showCar() {
    this.selectedCar = this.cars.filter(e => e.Make == this.carMake && e.Name == this.carModelSelect);
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
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

  calculateChargerTypes() {
    this.mennekes = 0;
    this.ccs = 0;
    this.jevs = 0;
    for (let index = 0; index < this.chargerChosen.Connector.length; index++) {
      const element = this.chargerChosen.Connector[index];
      console.log(typeof (element.ConnectorType))
      console.log(element.ConnectorType.includes('Mennekes'))
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

  secondsToHms(d) {
    d = Number(d);
    this.hours = Math.floor(d / 3600);
    this.minutes = Math.floor(d % 3600 / 60);
}

  clearOverlays() {
    for (var i = 0; i < this.markers.length; i++ ) {
      this.markers[i].setMap(null);
    }
    for (var i = 0; i < this.circles.length; i++ ) {
      this.circles[i].setMap(null);
    }
    this.markers.length = 0;
    this.circles.length = 0;
  }

  async addToQueue() {
    this.secondsToHms(this.timeToStay)
    if (!this.ourQueue) {
      this.ourEntity = {
        car: this.selectedCar[0].Name,
        time: {
          hours: this.hours,
          minutes: this.minutes,
        },
        place: 1,
        reserved: true,
        localId: 1
      }

      this.ourQueue = {
        id: this.chargerChosen.ChargeDeviceId,
        empty: false,
        entity: [this.ourEntity]
      }
      this.queue.push(this.ourQueue)
      this.chargerService.postQueue(this.ourQueue)
      .subscribe(data => {
        console.log(data)
      })
      this.startReservation();
    }
  }

  deleteQueue() {
    this.showError = 1;
    if (this.ourQueue.entity.length == 1) {
      this.chargerService.deleteQueue(this.ourQueue.id)
      .subscribe(data => {
        console.log(data)
      })
    }
  }

  startReservation() {
    var reserveInterval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(reserveInterval)
        this.deleteQueue()
        //clear array
      }
    },1000)
  }

  startCharging() {
    this.ourEntity.reserved = false;
    this.ourQueue.entity[0] = this.ourEntity;
    this.time = this.ourEntity.time.hours * 3600 + this.ourEntity.time.minutes * 60
    var chargeInterval = setInterval(() => {
      if(this.time > 0) {
        this.time--;
      } else {
        clearInterval(chargeInterval)
        //ended charging msg
        //clear array
      }
    },1000)
  }

  leaveCharger() {
    this.ourEntity = null;
    this.ourQueue = null;
    this.queueSection = false;
  }

  constructLink() {
    let link = "https://www.google.com/maps/dir/"
    this.link = link + this.fromLocation + "/"
    for (let index = 0; index < this.calculatedChargers.length; index++) {
      const element = this.calculatedChargers[index];
      this.link = this.link + element.ChargeDeviceLatitude + "," + element.ChargeDeviceLongitude + "/"
    }
    this.link = this.link + this.toLocation + "/"
    console.log(this.link)
  }

  async getAllOnRoute() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    directionsDisplay.setMap(this.map);
    var request = {
      origin: this.fromLocation,
      destination: this.toLocation,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      provideRouteAlternatives: true,
    };
    directionsService.route(request, (result, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        console.log(result);

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
            radius: 1000,
          });
          for (let index = 0; index < this.chargers.length; index++) {
            const lat = parseFloat(this.chargers[index].ChargeDeviceLatitude);
            const lng = parseFloat(this.chargers[index].ChargeDeviceLongitude);
            const point = new google.maps.LatLng(lat, lng);
            if (google.maps.geometry.spherical.computeDistanceBetween(point, circle.getCenter()) <= circle.getRadius()) {
              new google.maps.Marker({
                position: point,
                map: this.map,
              });
            }
          }
        }
        directionsDisplay.setDirections(result);
      }
    });
  }

  getOptimalRouteCustom() {
    this.directionsDisplay.setMap(null)
    this.test = 1;
    this.done = 0;
    this.calculatedChargers = []
    this.clearOverlays()
    this.directionsDisplay.setMap(this.map);
    console.log(this.toLocation)
    var request = {
      origin: this.fromLocation,
      destination: this.toLocation,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      provideRouteAlternatives: true,
    };
    console.log(request)
    let range = this.selectedCar[0].Range * (this.chargeAtStart / 100) * 1000;
    range = Math.floor(range - range * (this.chargeAtStop / 100));
    this.calculateRouteCustom(request, range);
  }

  getNextOptimalRouteCustom() {
    this.infoSection = false;
    this.listeners.forEach(function (item) {
      google.maps.event.removeListener(item);
    })

    console.log(this.chargerChosen)
    this.calculatedChargers.push(this.chargerChosen)
    this.directionsDisplay.setMap(this.map);

    let coords = new google.maps.LatLng(
      parseFloat(this.chargerChosen.ChargeDeviceLatitude),
      parseFloat(this.chargerChosen.ChargeDeviceLongitude)
    )
    var request = {
      origin: coords,
      destination: this.toLocation,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      provideRouteAlternatives: true,
    };
    let range = (this.selectedCar[0].Range - (this.chargeAtStop / 100)) * 1000;
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
        console.log(result)

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
    let eqs_real = this.selectedCar[0].Range * (this.chargeAtStart / 100) * 1000;
    eqs_real = Math.floor(eqs_real - eqs_real * (this.chargeAtStop / 100));
    console.log(eqs_real)
    var request = {
      origin: this.fromLocation,
      destination: this.toLocation,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      provideRouteAlternatives: true,
    };
    this.directionsService.route(request, (result, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        console.log(result)

        let path_done = 0;
        let pathWhereChargerNeeded = 0;

        for (let i = 0; i < result.routes[0].legs[0].steps.length; i++) {
          console.log(eqs_real)
          let previous_path = path_done;
          path_done = path_done + result.routes[0].legs[0].steps[i].distance.value
          let j = 0; // index of the remaining path to the max range of the vehicle

          if (path_done > eqs_real) {
            if (result.routes[0].legs[0].steps[i].distance.value < previous_path) {
              pathWhereChargerNeeded = (eqs_real - previous_path) / result.routes[0].legs[0].steps[i].distance.value;
              j = Math.floor(pathWhereChargerNeeded * result.routes[0].legs[0].steps[i].path.length);
              this.getOptimalChargers(result, i, j);
              path_done = path_done - eqs_real + 5000;
              console.log(path_done)
              eqs_real = Math.floor((this.selectedCar[0].Range - (this.chargeAtStop/100)) * 1000)
            }
            else {
              pathWhereChargerNeeded = (eqs_real - previous_path) / result.routes[0].legs[0].steps[i].distance.value;
              j = Math.floor(pathWhereChargerNeeded * result.routes[0].legs[0].steps[i].path.length);
              this.getOptimalChargers(result, i, j);
              path_done = path_done - eqs_real + 5000;
              console.log(path_done)
              eqs_real = Math.floor((this.selectedCar[0].Range - (this.chargeAtStop/100)) * 1000)
              if (path_done > eqs_real) {
                pathWhereChargerNeeded = eqs_real / path_done;
                j = Math.floor(pathWhereChargerNeeded * result.routes[0].legs[0].steps[i].path.length);
                this.getOptimalChargers(result, i, j);
                path_done = path_done - eqs_real;
                console.log(path_done)
                eqs_real = Math.floor((this.selectedCar[0].Range - (this.chargeAtStop/100)) * 1000)
              }
            }
          }
        };
        this.directionsDisplay.setDirections(result);
      }
    })
  }

  getOptimalChargers(result, i, j) {
    let chargers_counter = 0;
    let radiusOfSearch = 1000;
    while (chargers_counter == 0) {
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
          chargers_counter += 1;
          let marker = new google.maps.Marker({
            position: point,
            map: this.map,
          });
          this.markers.push(marker);
          this.calculatedChargers.push(this.chargers[index]);
          break;
        }
      }
      radiusOfSearch += 1000;
    }
    this.done = 1;
    this.constructLink();
  }
}
