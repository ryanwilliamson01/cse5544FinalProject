import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import 'leaflet.heat';
import * as turf from '@turf/turf';
import 'hammerjs';
import { TransityService } from './transity.service';
import 'leaflet-freehandshapes';
import 'leaflet.polyline.snakeanim';
import 'colormap';
import 'color-interpolate';
import 'd3-interpolate';
import * as d3 from 'd3';
import { generate } from 'rxjs';
import 'leaflet-dvf';

declare let L;

const HEATMAP_START_COLOR = '#ccffff';
const HEATMAP_END_COLOR = '#ff0000'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {

  time = 0;
  timeHex = 0;
  heatmap;
  hexmap;
  map;
  max;
  originDraw;
  destinationDraw;

  features = [];
  polylines = [];
  tickSize = 1;
  stepSize = .25;
  hexGrid;
  hexPolygons = [];
  loading = false;
  hoverEnabled = false;



  constructor(private dataService: DataService, private transity: TransityService) {

  }

  ngOnInit() {

    this.map = L.map('map').setView([40.0142, -83.0309], 11);
    this.max = 0;

    const CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });
    const CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });
    const CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });

    CartoDB_Voyager.addTo(this.map);

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

    this.loading = true;
    this.transity.getAllPoints().subscribe(res => {
      console.log('recieved');

      this.features = res;
      this.heatmap = this.journeysToHeatmap(res, {});
      this.hexmap = this.journeysToHexmap(res, {});
      this.hexmap.addTo(this.map);
      this.loading = false;
      console.log(this.hexmap);
    });

  }
  hideHexmap() {
    this.map.removeLayer(this.hexmap);
  }

  generateHexGrid(journeys: any[]) {
    const bbox = turf.bbox(turf.bboxPolygon([-83.2, 39.822358, -82.809992, 40.153282]));
    const cellsize = 2.3;
    const hexgrid = turf.hexGrid(bbox, cellsize);

    // console.log(hexgrid);
    // let max = 0;
    // let reduced = points.splice(0, 25000);

    journeys.forEach(journey => {
      hexgrid.features.forEach(hex => {
        if (!hex.properties.numPoints) {
          hex.properties = {
            numPoints: 0,
            journeys: []
          };
        }
        if (turf.booleanContains(hex, turf.point([journey.path[0].lon, journey.path[0].lat]))) {
          hex.properties.numPoints += 1;
          hex.properties.journeys.push(journey);
          this.max = hex.properties.numPoints > this.max ? hex.properties.numPoints : this.max;
          return;
        }
      });
    });
    const colormap = d3.interpolateRgb(HEATMAP_START_COLOR, HEATMAP_END_COLOR);
    const maxAdj = 0.3 * this.max;


    console.log(hexgrid);
    this.hexGrid = hexgrid;
    return L.geoJson(hexgrid, {
      style: function (feature) {
        return {
          'color': colormap(feature.properties.numPoints / (200)),
          'weight': 1,
          'fillOpacity': 0.5,
          'opacity': 0.5
        };
      },
      onEachFeature: (feature, layer) => {
        const centroid = turf.centroid(feature);
        const latlng = new L.LatLng(centroid.geometry.coordinates[1], centroid.geometry.coordinates[0])
        const hex = this.generateHexChart(feature.properties.journeys, 20, latlng);
        // console.log(hex);
        this.hexPolygons.push(hex);
        layer.on('mouseover', (e) => {
          if (this.hoverEnabled) {
            this.map.addLayer(hex);
          }

        });
        layer.on('mouseout', (e) => {
          if (this.hoverEnabled) {
            this.map.removeLayer(hex);
          }
        })
        layer.on('click', (e) => {

          this.polylines.forEach(p => this.map.removeLayer(p));
          this.polylines = [];
          e.sourceTarget.feature.properties.journeys.forEach(j => {
            const p = L.polyline(j.path, { color: 'green', weight: 0.33 });
            this.polylines.push(p);
            try {
              p.addTo(this.map).snakeIn();
            } catch (e) {

            }
          });
          // console.log("e", );

        });
      }
    });
  }
  journeysToHexmap(journeys: any[], options) {
    const coords = [];
    // journeys.forEach(journey => {
    //   coords.push();
    // })
    return this.generateHexGrid(journeys);
  }
  journeysToHeatmap(journeys: any[], options) {
    const coords = [];
    const data = journeys.map(journey => L.polyline(journey.path, { color: 'red', weight: 0.33 }));
    data.forEach(journey => {
      journey._latlngs.forEach((point) => coords.push(point));
    });
    return L.heatLayer(coords, options);
  }
  filterHeatmap() {
    const filteredJourneys = this.features.filter(j => {
      return this.time <= j.start / 60 && j.start / 60 <= this.time + this.tickSize;
    });
    this.map.removeLayer(this.heatmap);
    this.heatmap = this.journeysToHeatmap(filteredJourneys, { radius: 20, maxZoom: 15 }).addTo(this.map);
  }
  filterHexmap() {
    this.map.removeLayer(this.hexmap);
    // Update all of the values and calculate the new max
    // let max = 0
    Object.keys(this.hexmap._layers).forEach(key => {
      const hex = this.hexmap._layers[key];
      let newCount = 0;
      hex.feature.properties.journeys.forEach(j => {
        if (this.timeHex <= j.start / 60 && j.start / 60 <= this.timeHex + this.tickSize) {
          newCount += 1;
        }
      });
      hex.feature.properties.filteredCount = newCount;
    });
    const colormap = d3.interpolateRgb(HEATMAP_START_COLOR, HEATMAP_END_COLOR);
    Object.keys(this.hexmap._layers).forEach(key => {
      const hex = this.hexmap._layers[key];
      hex.options.color = colormap(hex.feature.properties.filteredCount / (45));
    });
    this.map.addLayer(this.hexmap);
  }
  resetHeatmap() {
    const points = this.features.map(f => {
      return new L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]);
    });
    this.map.removeLayer(this.heatmap);
    this.heatmap = L.heatLayer(points).addTo(this.map);
  }
  showAllHexPolygons() {
    this.hexPolygons.forEach((hex) => this.map.addLayer(hex));
  }
  hideAllHexPolygons() {
    this.hexPolygons.forEach((hex) => this.map.removeLayer(hex));
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
  showHexmap() {
    this.map.addLayer(this.hexmap);
  }
  showAllJourneys() {
    const journeys = this.features.map(journey => L.polyline(journey.path, { color: 'red', weight: 0.1 }));
    this.polylines = journeys;
    journeys.forEach(j => j.addTo(this.map).snakeIn());
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
          // do nothing
        }
        // L.circleMarker(line._latlngs[line._latlngs.length - 1], { color: 'green' }).addTo(this.map);
      });
    });

  }
  maxNum(num1, num2) {
    return num1 > num2 ? num1 : num2;
  }
  minNum(num1, num2) {
    return num1 < num2 ? num1 : num2;
  }
  generateHexChart(journeys, radius, latlng) {

    const data = {
      'Walking': 0,
      'Biking': 0,
      'Driving Slowly': 0,
      'Driving Fast': 0,
    };
    const chartOptions = {
      'Walking': {},
      'Biking': {},
      'Driving Slowly': {},
      'Driving Fast': {}
    };
    // const colormap = d3.interpolateRgb(HEATMAP_START_COLOR, HEATMAP_END_COLOR);

    journeys.forEach(j => {
      if (j.speed < 6) {
        data['Walking']++;
      } else if (j.speed < 12) {
        data['Biking']++;
      } else if (j.speed < 35) {
        data['Driving Slowly']++;
      } else {
        data['Driving Fast']++;
      }
    });
    data['Walking'] = data['Walking'] / journeys.length;
    data['Biking'] = data['Biking'] / journeys.length;
    data['Driving Slowly'] = data['Driving Slowly'] / journeys.length;
    data['Driving Fast'] = data['Driving Fast'] / journeys.length;

    // const max = this.maxNum(this.maxNum(this.maxNum(data['walking'], data['Biking']), data['Driving Slowly']), data['Driving Fast']);
    // const min = this.minNum(this.minNum(this.minNum(data['walking'], data['Biking']), data['Driving Slowly']), data['Driving Fast']);
    // const max = 20;
    const max = 1;
    const min = 0;
    const maxRadius = radius;
    chartOptions['Walking'] = {
      fillColor: '#66c2a5',
      minValue: min,
      maxValue: max,
      displayOptions: {
        excludeFromTooltip: true
      },
      maxRadius: maxRadius,
      displayText: function (value) {
        return value.toFixed(2);
      }
    };
    chartOptions['Biking'] = {
      fillColor: '#fc8d62',
      minValue: min,
      maxValue: max,
      displayOptions: {
        excludeFromTooltip: true
      },
      maxRadius: maxRadius,
      displayText: function (value) {
        return value.toFixed(2);
      }
    };
    chartOptions['Driving Slowly'] = {
      fillColor: '#8da0cb',
      minValue: min,
      maxValue: max,
      displayOptions: {
        excludeFromTooltip: true
      },
      maxRadius: maxRadius,
      displayText: function (value) {
        return value.toFixed(2);
      }
    };
    chartOptions['Driving Fast'] = {
      fillColor: '#e78ac3',
      minValue: min,
      displayOptions: {
        excludeFromTooltip: true
      },
      maxValue: max,
      maxRadius: maxRadius,
      displayText: function (value) {
        return value.toFixed(2);
      }
    };


    const options = {
      data: data,
      chartOptions: chartOptions,
      numberOfSides: 6,
      weight: 1,
      radius: radius,
      color: '#000000',
      fillOpacity: 0.7,
      showLegendTooltips: true,
      tooltipOptions: {
        iconSize: new L.Point(0, 0),
        iconAnchor: new L.Point(-5000, 5000)
      },

      gradient: false
    };
    return new L.StackedRegularPolygonMarker(latlng, options);

  }
}


