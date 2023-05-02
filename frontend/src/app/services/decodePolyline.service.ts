import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DecodePolylineService {

  constructor() { }

  // This function decodes the polyline
  decode(encoded: string) {

    // Array that holds the points
    var points = []
    var index = 0, len = encoded.length;
    var lat = 0, lng = 0;
    // While the index is less than the length of the encoded string
    while (index < len) {
      // Variable that holds the ascii of the character at the index
      var b, shift = 0, result = 0;
      do { // Do while the ascii is greater than 0x20
        b = encoded.charAt(index++).charCodeAt(0) - 63; // Finds ascii and substract it by 63
        result |= (b & 0x1f) << shift; // Bitwise OR
        shift += 5; // Shift by 5
      } while (b >= 0x20);

      var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1)); // Bitwise OR
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) }) 

    }
    return points

  }
}
