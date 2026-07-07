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

  obtenerUbicacion(lat: number, lon: number): Observable<{ origen: string, zona: string }> {

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  return this.http.get<any>(url).pipe(

    map(resp => {

      const a = resp.address;

      const origen = [
        a.road,
        a.house_number,
        a.neighbourhood
      ]
      .filter(Boolean)
      .join(', ');

      const zona = a.neighbourhood
        ? a.neighbourhood.replace(/^Barrio\s+/i, '').trim()
        : 'Centro';

      return {
        origen,
        zona
      };

    })

  );

 }
}