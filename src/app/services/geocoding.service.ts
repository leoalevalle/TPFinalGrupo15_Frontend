import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private apiUrl = 'https://forward-reverse-geocoding.p.rapidapi.com/v1/reverse';
  private apiKey = '8a0ea54fd6mshab34eca36b6ed91p1cf7e1jsndd6039ae4360'; 
  private apiHost = 'forward-reverse-geocoding.p.rapidapi.com';

  constructor(private http: HttpClient) {}

  obtenerNombreZona(lat: number, lng: number): Observable<string> {
  const headers = new HttpHeaders()
    .set('X-RapidAPI-Key', this.apiKey)
    .set('X-RapidAPI-Host', this.apiHost);

  const url = `${this.apiUrl}?lat=${lat}&lon=${lng}&accept-language=es`;

  return this.http.get<any>(url, { headers }).pipe(
    map(res => {
      console.log("Respuesta completa de la API:", res);
      if (res.display_name) {
        const partes = res.display_name.split(',');
        return partes.slice(0, 3).join(',').trim();
      }
      if (res.address) {
        const calle = res.address.road || res.address.pedestrian || 'Calle desconocida';
        const altura = res.address.house_number || '';
        const barrio = res.address.suburb || res.address.neighbourhood || '';
        let direccionEspecifica = `${calle} ${altura}`.trim();
        if (barrio) {
          direccionEspecifica += `, ${barrio}`;
        }
        return direccionEspecifica;
      }
      return 'Ubicación Detectada';
    })
  );
 }
}