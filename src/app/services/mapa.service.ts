import { Injectable, OnDestroy } from '@angular/core';
import * as maplibregl from 'maplibre-gl';

@Injectable({
  providedIn: 'root'
})
export class MapaService implements OnDestroy {
  private map!: maplibregl.Map;
  private marcadorOrigen!: maplibregl.Marker;
  private marcadorDestino!: maplibregl.Marker;
  private geoapifyApiKey: string = '25ab86606b5a4c959bbd88baa4372d73'; 

  constructor() {}

  
  inicializarMapa(containerId: string, lng: number, lat: number, zoom: number = 15): maplibregl.Map {
    this.destruirMapa();

    const mapStyle = `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${this.geoapifyApiKey}`;

    this.map = new maplibregl.Map({
      container: containerId,
      style: mapStyle,
      center: [lng, lat],
      zoom: zoom
    });
    this.map.addControl(new maplibregl.NavigationControl());
    this.fijarMarcadorOrigen(lng, lat);
    return this.map;
  }

  fijarMarcadorOrigen(lng: number, lat: number): void {
    if (!this.map) return;
    if (this.marcadorOrigen) this.marcadorOrigen.remove();

    this.marcadorOrigen = new maplibregl.Marker({ color: '#e11d48' }) // Rosa
      .setLngLat([lng, lat])
      .addTo(this.map);
  }

  fijarMarcadorDestino(lng: number, lat: number): void {
    if (!this.map) return;
    if (this.marcadorDestino) this.marcadorDestino.remove();

    this.marcadorDestino = new maplibregl.Marker({ color: '#2563eb' }) // Azul
      .setLngLat([lng, lat])
      .addTo(this.map);

    // Mágia: Ajusta el mapa para que se vean AMBOS al mismo tiempo
    this.ajustarVistaAMbosPuntos();
  }

  private ajustarVistaAMbosPuntos(): void {
    if (!this.marcadorOrigen || !this.marcadorDestino) return;

    const p1 = this.marcadorOrigen.getLngLat();
    const p2 = this.marcadorDestino.getLngLat();

    // Creamos los límites geográficos basados en las dos coordenadas
    const bounds = new maplibregl.LngLatBounds()
      .extend(p1)
      .extend(p2);

    // Hace un zoom dinámico dejando un margen (padding) de 60px para que no queden pegados al borde
    this.map.fitBounds(bounds, {
      padding: 60,
      maxZoom: 15,
      duration: 1500 // Animación suave de 1.5 segundos
    });
  }

  destruirMapa(): void {
    if (this.marcadorOrigen) this.marcadorOrigen.remove();
    if (this.marcadorDestino) this.marcadorDestino.remove();
    if (this.map) this.map.remove();
  }

  trazarRuta(lngOrigen: number, latOrigen: number, lngDestino: number, latDestino: number): void {
  if (!this.map) return;

  const url = `https://api.geoapify.com/v1/routing?waypoints=${latOrigen},${lngOrigen}|${latDestino},${lngDestino}&mode=drive&apiKey=${this.geoapifyApiKey}`;

  // Hacemos el fetch nativo para que no lo altere ningún interceptor
  fetch(url)
    .then(res => res.json())
    .then(routeResult => {
      if (!routeResult.features || routeResult.features.length === 0) return;

      // Geoapify nos devuelve las coordenadas de la ruta en formato GeoJSON
      const geojsonRoute = routeResult.features[0];

      // Si la capa de la ruta ya existía de un viaje previo, la removemos
      if (this.map.getLayer('route')) {
        this.map.removeLayer('route');
        this.map.removeSource('route');
      }

      // Añadimos las coordenadas calculadas como fuente de datos en el mapa
      this.map.addSource('route', {
        type: 'geojson',
        data: geojsonRoute
      });

      // Dibujamos la línea sobre el mapa con un diseño personalizado
      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ff5fa2', // Color rosa que usa tu panel de conductora
          'line-width': 5,          // Grosor de la línea de conducción
          'line-opacity': 0.85
        }
      });

      // Ajustamos la cámara automáticamente para que la conductora vea todo el trayecto
      const bounds = new maplibregl.LngLatBounds()
        .extend([lngOrigen, latOrigen])
        .extend([lngDestino, latDestino]);

      this.map.fitBounds(bounds, { padding: 50 });
    })
    .catch(err => console.error("Error trazando la ruta de Geoapify:", err));
    }

  ngOnDestroy(): void {
    this.destruirMapa();
  }
}