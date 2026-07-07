import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PasajeraService {
  private api = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  crearSolicitud(data: {
    idPasajera: number;
    origen: string;
    destino: string;
    zona: string;
    cantPasajeros: number;
  }): Observable<any> {
    return this.http.post(`${this.api}/solicitudes/${data.idPasajera}`, data, {
      headers: this.headers(),
    });
  }

  cancelarSolicitud(idSolicitud: number): Observable<any> {
    return this.http.put(
      `${this.api}/solicitudes/${idSolicitud}/cancelar`,
      {},
      { headers: this.headers() },
    );
  }
}
