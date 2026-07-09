import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OperadoraService {
  private api = 'http://localhost:3000/api/transaccion';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  listarSolicitudesPendientes(userId: number): Observable<any> {
    return this.http.get(`${this.api}/operadora/solicitudes`, {
      headers: this.headers(),
    });
  }

  conductorasDisponibles(zona: string): Observable<any> {
    return this.http.get(`${this.api}/operadora/conductoras-zona`, {
      headers: this.headers(),
      params: { zona },
    });
  }

  asignarPropuesta(data: { idSolicitud: number; idConductora: number }): Observable<any> {
    return this.http.put(`${this.api}/operadora/asignar-propuesta`, data, {
      headers: this.headers(),
    });
  }

  registrarViaje(data: {
    idSolicitud: number;
    idOperadora: number;
    patenteVehiculo: string;
  }): Observable<any> {
    return this.http.post(`${this.api}/viajes`, data, {
      headers: this.headers(),
    });
  }

  finalizarViaje(idViaje: number): Observable<any> {
    return this.http.put(
      `${this.api}/viajes/${idViaje}/finalizar`,
      {},
      { headers: this.headers() },
    );
  }
}
