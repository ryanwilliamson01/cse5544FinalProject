import { Component } from '@angular/core';
import { DataService } from './data.service';
import 'leaflet.heat';


declare let L;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    const map = L.map('map').setView([40.0142, -83.0309], 13);
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

    CartoDB_Voyager.addTo(map);

    this.dataService.getTwitter().subscribe(data => {
      // L.geoJson(data).addTo(map);
      let features = [];
      let coords = [];
      L.geoJson(data, {
        onEachFeature: (feature, layer) => {
          features.push(feature);
          let latlng = new L.latLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0])
          coords.push(latlng)
        }
      });
      console.log(coords);
      var heat = L.heatLayer(coords).addTo(map);
    });


  }
}
