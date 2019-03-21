import { Component } from '@angular/core';
import { DataService } from './data.service';
import 'leaflet.heat';
import * as turf from '@turf/turf'
import 'hammerjs';
import { TransityService } from './transity.service';
import 'leaflet-freehandshapes';
import 'leaflet.polyline.snakeanim';

declare let L;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  time = 0;
  heatmap;
  map;
  originDraw;
  destinationDraw;

  features = [];
  polylines = [];
  tickSize = 1;

  constructor(private dataService: DataService, private transity: TransityService) {

  }

  ngOnInit() {
    this.map = L.map('map').setView([40.0142, -83.0309], 15);

    let CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });
    let CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });
    let CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });

    CartoDB_DarkMatter.addTo(this.map);

    this.originDraw = new L.FreeHandShapes({
      className: 'leaflet-free-hand-shapes',
      smoothFactor: 1,
      simplify_tolerance: 0,
      fillOpacity: 0.5,
      polygon: {
        color: '#58b3ef',
        fillColor: '#58b3ef',
        weight: 3,
        smoothFactor: 0
      },
      polyline: {
        color: '#58b3ef',
        smoothFactor: 0
      },
      noClip: true
    });
    this.destinationDraw = new L.FreeHandShapes({
      className: 'leaflet-free-hand-shapes',
      smoothFactor: 1,
      simplify_tolerance: 0,
      fillOpacity: 0.5,
      polygon: {
        color: '#f26d6d',
        fillColor: '#f26d6d',
        weight: 3,
        smoothFactor: 0
      },
      polyline: {
        color: '#f26d6d',
        smoothFactor: 0
      },
      noClip: true
    });
    this.map.addLayer(this.originDraw);
    this.map.addLayer(this.destinationDraw);

    // this.dataService.getTwitter().subscribe(data => {
    //   // L.geoJson(data).addTo(map);

    //   let coords = [];
    //   L.geoJson(data, {
    //     onEachFeature: (feature, layer) => {
    //       this.features.push(feature);
    //       let latlng = new L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
    //       coords.push(latlng)
    //     }
    //   });

    //   this.heatmap = L.heatLayer(coords).addTo(this.map);
    // });

    this.transity.getAllPoints().subscribe(res => {
      console.log(res);

      this.features = res;
      this.heatmap = this.journeysToHeatmap(res, {});
    })
  }
  journeysToHeatmap(journeys: any[], options) {
    let coords = [];
    let data = journeys.map(journey => L.polyline(journey.path, { color: 'red', weight: 0.33 }))
    data.forEach(journey => {
      journey._latlngs.forEach((point) => coords.push(point));
    })
    return L.heatLayer(coords, options).addTo(this.map);
  }
  filterHeatmap() {
    let filteredJourneys = this.features.filter(j => {
      return this.time <= j.start / 60 && j.start / 60 <= this.time + this.tickSize;
    })
    this.map.removeLayer(this.heatmap);
    this.heatmap = this.journeysToHeatmap(filteredJourneys, { radius: 20, maxZoom: 15 }).addTo(this.map);
  }
  resetHeatmap() {
    let points = this.features.map(f => {
      return new L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0])
    });
    this.map.removeLayer(this.heatmap);
    this.heatmap = L.heatLayer(points).addTo(this.map);
  }
  startDrawing() {
    this.originDraw.setMode('add');
    this.polylines.forEach(line => this.map.removeLayer(line));
  }
  editDrawing() {
    this.originDraw.setMode('delete');
  }
  hideHeatmap() {
    this.map.removeLayer(this.heatmap);
  }
  showHeatmap() {
    this.map.addLayer(this.heatmap);
  }
  showAllJourneys() {
    let journeys = this.features.map(journey => L.polyline(journey.path, { color: 'red', weight: 0.1 }))
    this.polylines = journeys;
    journeys.forEach(j => j.addTo(this.map).snakeIn())
  }
  removeAllJourneys() {
    this.polylines.forEach(p => this.map.removeLayer(p));
  }
  stopDrawing() {
    this.originDraw.setMode('view');
    this.polylines.forEach(line => this.map.removeLayer(line));
    this.transity.getPolygonJourneys(this.originDraw, this.destinationDraw, this.time).subscribe(res => {
      this.polylines = res;
      this.polylines.forEach(line => {
        try {
          line.addTo(this.map).snakeIn();
        } catch (e) {
          //do nothing
        }
        // L.circleMarker(line._latlngs[line._latlngs.length - 1], { color: 'green' }).addTo(this.map);
      });
    })

  }
}
