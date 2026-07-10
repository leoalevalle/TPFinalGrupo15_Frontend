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
buscarSugerencias(texto: string, lat: number, lon: number): Observable<any[]> {
  const apiKey = '25ab86606b5a4c959bbd88baa4372d73'; // Usa tu API Key de Geoapify
  
  // Codificamos el texto para la URL
  const query = encodeURIComponent(texto);
  
  // Configuramos filtros: sesgar por ubicación actual (bias) y filtrar solo por Argentina (countrycode:ar)
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&filter=countrycode:ar&bias=proximity:${lon},${lat}&limit=5&format=json&apiKey=${apiKey}`;

  const headers = new HttpHeaders();

  return this.http.get<any>(url, { headers: headers }).pipe(
    map(resp => {
      if (!resp.results) return [];

      return resp.results.map((item: any) => ({
        direccionCompleta: item.formatted,
        nombreCorto: item.name || item.address_line1,
        lon: item.lon,
        lat: item.lat
      }));
    })
  );
  }
}