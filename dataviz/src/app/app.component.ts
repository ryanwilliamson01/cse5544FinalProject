import { Component } from '@angular/core';
import { DataService } from './data.service';
import 'leaflet.heat';
import * as turf from '@turf/turf'
import 'hammerjs';

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
  features = [];
  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    this.map = L.map('map').setView([40.0142, -83.0309], 13);
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

    CartoDB_Voyager.addTo(this.map);


    this.dataService.getTwitter().subscribe(data => {
      // L.geoJson(data).addTo(map);

      let coords = [];
      L.geoJson(data, {
        onEachFeature: (feature, layer) => {
          this.features.push(feature);
          let latlng = new L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
          coords.push(latlng)
        }
      });
      console.log(coords);
      this.heatmap = L.heatLayer(coords).addTo(this.map);
    });


  }

  filterHeatmap() {
    let points = this.features.filter(f => {
      let date = new Date(f.properties.time);
      return date.getHours() == this.time;
    }).map(f => {
      return new L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0])
    });
    this.map.removeLayer(this.heatmap);
    this.heatmap = L.heatLayer(points, {radius: 25, maxZoom:18}).addTo(this.map);

  }
}
