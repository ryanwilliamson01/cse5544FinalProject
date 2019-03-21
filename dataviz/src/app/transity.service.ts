import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { isArray } from 'util';

declare let L;

@Injectable({
  providedIn: 'root'
})
export class TransityService {

  private journeysURL = 'https://transity.herokuapp.com/cuebiq/journeys';
  constructor(private http: HttpClient) { }

  getPolygonJourneys(originPoints: any[], destinationPoints: any[], time?) {
    const options = {
      params: new HttpParams().set('geoscoped', 'true'),
      header: new HttpHeaders({ 'Content-Type:': 'application/json' })
    }
    let origins = this.parseDrawingObject(originPoints).map(polygon => { return { points: this.convertPoints(polygon) } });
    let destinations = this.parseDrawingObject(destinationPoints).map(polygon => { return { points: this.convertPoints(polygon) } });

    return this.http.post<any[]>(this.journeysURL, {
      origins: origins,
      destinations: destinations
    }, options).pipe(map(res => {
      if (isArray(res)) {
        let journeys = res;
        console.log(journeys);
        if (time) {
          journeys = journeys.filter(j => {
            return time <= j.start / 60 && j.start / 60 <= time + 1;
          })
        }
        console.log(journeys.length);
        return journeys.map(journey => L.polyline(journey.path, { color: 'red', weight: 0.33 }))
      }
      return [];
    }));
  }
  getAllPoints() {
    const options = {
      params: new HttpParams().set('geoscoped', 'true'),
      header: new HttpHeaders({ 'Content-Type:': 'application/json' })
    }
    let origins = [{ "points": [{ "lat": 39.744154, "lon": -82.733917 }, { "lat": 39.746266, "lon": -82.772369 }, { "lat": 39.749434, "lon": -82.810822 }, { "lat": 39.755769, "lon": -82.87674 }, { "lat": 39.768436, "lon": -82.939911 }, { "lat": 39.777936, "lon": -82.96875 }, { "lat": 39.788489, "lon": -82.997589 }, { "lat": 39.796931, "lon": -83.015442 }, { "lat": 39.805371, "lon": -83.030548 }, { "lat": 39.813811, "lon": -83.041534 }, { "lat": 39.820139, "lon": -83.049774 }, { "lat": 39.848612, "lon": -83.107452 }, { "lat": 39.864425, "lon": -83.137665 }, { "lat": 39.881289, "lon": -83.166504 }, { "lat": 39.897094, "lon": -83.19397 }, { "lat": 39.919216, "lon": -83.222809 }, { "lat": 39.938172, "lon": -83.246155 }, { "lat": 39.953964, "lon": -83.262634 }, { "lat": 39.968701, "lon": -83.27774 }, { "lat": 39.984486, "lon": -83.291473 }, { "lat": 40.00658, "lon": -83.30658 }, { "lat": 40.021305, "lon": -83.309326 }, { "lat": 40.034975, "lon": -83.309326 }, { "lat": 40.048643, "lon": -83.307953 }, { "lat": 40.081224, "lon": -83.291473 }, { "lat": 40.099084, "lon": -83.280487 }, { "lat": 40.12009, "lon": -83.266754 }, { "lat": 40.136891, "lon": -83.254395 }, { "lat": 40.149488, "lon": -83.243408 }, { "lat": 40.162083, "lon": -83.232422 }, { "lat": 40.175726, "lon": -83.220062 }, { "lat": 40.186218, "lon": -83.207703 }, { "lat": 40.199855, "lon": -83.184357 }, { "lat": 40.207197, "lon": -83.170624 }, { "lat": 40.209294, "lon": -83.162384 }, { "lat": 40.214538, "lon": -83.140411 }, { "lat": 40.216635, "lon": -83.122559 }, { "lat": 40.216635, "lon": -83.107452 }, { "lat": 40.216635, "lon": -83.088226 }, { "lat": 40.216635, "lon": -83.067627 }, { "lat": 40.216635, "lon": -83.048401 }, { "lat": 40.215587, "lon": -83.030548 }, { "lat": 40.213489, "lon": -83.007202 }, { "lat": 40.211392, "lon": -82.983856 }, { "lat": 40.203002, "lon": -82.945404 }, { "lat": 40.197757, "lon": -82.926178 }, { "lat": 40.184119, "lon": -82.890472 }, { "lat": 40.179923, "lon": -82.882233 }, { "lat": 40.172578, "lon": -82.87262 }, { "lat": 40.167331, "lon": -82.867126 }, { "lat": 40.184119, "lon": -82.801208 }, { "lat": 40.184119, "lon": -82.798462 }, { "lat": 40.184119, "lon": -82.792969 }, { "lat": 40.179923, "lon": -82.754517 }, { "lat": 40.169429, "lon": -82.718811 }, { "lat": 40.158935, "lon": -82.689972 }, { "lat": 40.146339, "lon": -82.661133 }, { "lat": 40.123241, "lon": -82.617188 }, { "lat": 40.110638, "lon": -82.602081 }, { "lat": 40.099084, "lon": -82.588348 }, { "lat": 40.089629, "lon": -82.577362 }, { "lat": 40.062308, "lon": -82.55127 }, { "lat": 40.04654, "lon": -82.537537 }, { "lat": 40.033924, "lon": -82.52655 }, { "lat": 40.021305, "lon": -82.516937 }, { "lat": 40.00658, "lon": -82.505951 }, { "lat": 39.97712, "lon": -82.489471 }, { "lat": 39.959228, "lon": -82.482605 }, { "lat": 39.941331, "lon": -82.477112 }, { "lat": 39.924482, "lon": -82.477112 }, { "lat": 39.906576, "lon": -82.477112 }, { "lat": 39.888665, "lon": -82.481232 }, { "lat": 39.853884, "lon": -82.494965 }, { "lat": 39.83385, "lon": -82.505951 }, { "lat": 39.81803, "lon": -82.516937 }, { "lat": 39.802206, "lon": -82.533417 }, { "lat": 39.786379, "lon": -82.552643 }, { "lat": 39.774769, "lon": -82.571869 }, { "lat": 39.759991, "lon": -82.606201 }, { "lat": 39.756824, "lon": -82.617188 }, { "lat": 39.747322, "lon": -82.663879 }, { "lat": 39.744154, "lon": -82.695465 }] }];
    let destinations = [];

    return this.http.post<any[]>(this.journeysURL, {
      origins: origins,
      destinations: destinations
    }, options).pipe(map(res => {
      return res;
    }));
  }

  convertPoints(points: any[]) {
    return points.map(p => {
      return { lat: p.lat, lon: p.lng };
    })
  }
  parseDrawingObject(drawingObj): any[] {
    if (drawingObj._layers) {
      let points = [];
      Object.keys(drawingObj._layers).forEach((key) => {
        points.push(drawingObj._layers[key]._latlngs[0])
      })
      return points;
    }
    return [];
  }
}
