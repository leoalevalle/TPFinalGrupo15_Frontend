import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PasajeraService {
  private api = 'https://tpfinalgrupo15-backend.onrender.com/api/transaccion';
  //private api = 'http://localhost:3000/api/transaccion';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  // POST /api/solicitudes
  crearSolicitudViaje(datosSolicitud: {
    idPasajera: number;
    origen: string;
    destino: string;
    tarifaEstimada?: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.api}/solicitudes`, datosSolicitud);
  }

  // PUT /api/solicitudes/:id/cancelar
  cancelarSolicitud(idUsuario: number, idSolicitud: number): Observable<any> {
    return this.http.put(
      `${this.api}/solicitudes/${idUsuario}/cancelar`,
      { idSolicitud },
      { headers: this.headers() },
    );
  }

  //Ruta: POST /api/viajes
  registrarViaje(datosViaje: {
    idSolicitud: number;
    idConductora: number;
    idPasajera: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.api}/viajes`, datosViaje);
  }

  // Ruta: PUT /api/viajes/:id/finalizar

  informarFinViaje(
    idViaje: number,
    datosFin?: { montoFinal?: number; metodoPago?: string },
  ): Observable<any> {
    return this.http.put<any>(`${this.api}/viajes/${idViaje}/finalizar`, datosFin || {});
  }

  // Ruta: GET /api/operadora/solicitudes

  listarSolicitudesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/operadora/solicitudes`);
  }
}
