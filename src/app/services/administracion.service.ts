import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministracionService {
  private api = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  // =========================================================================
  // GESTIÓN DE USUARIOS / PASAJERAS / CONDUCTORAS
  // =========================================================================

  // Ruta: PUT /api/usuarios/:id/estado
  cambiarEstadoLogicoUsuario(idUsuario: number, activo: boolean): Observable<any> {
    return this.http.put<any>(`${this.api}/usuarios/${idUsuario}/estado`, { activo });
  }

  // Ruta: PUT /api/pasajeras/:id/evaluar
  evaluarRegistroPasajera(idPasajera: number, datosEvaluacion: { aprobado: boolean; observaciones?: string }): Observable<any> {
    return this.http.put<any>(`${this.api}/pasajeras/${idPasajera}/evaluar`, datosEvaluacion);
  }

  // Ruta: PUT /api/conductoras/:id/evaluar
  evaluarRegistroConductora(idConductora: number, datosEvaluacion: { aprobado: boolean; observaciones?: string }): Observable<any> {
    return this.http.put<any>(`${this.api}/conductoras/${idConductora}/evaluar`, datosEvaluacion);
  }

  // =========================================================================
  // GESTIÓN DE VEHÍCULOS (RUTAS ESTÁNDAR / MIXTAS)
  // =========================================================================

  //Ruta: PUT /api/vehiculos/:id/estado
  cambiarEstadoLogicoVehiculoGenerico(idVehiculo: number, activo: boolean): Observable<any> {
    return this.http.put<any>(`${this.api}/vehiculos/${idVehiculo}/estado`, { activo });
  }

  // Ruta: PUT /api/conductoras/:idConductora/cambiar-vehiculo

  gestionarCambioVehiculoPorConductora(idConductora: number, datosCambio: any): Observable<any> {
    return this.http.put<any>(`${this.api}/conductoras/${idConductora}/cambiar-vehiculo`, datosCambio);
  }

  // =========================================================================
  // GESTIÓN DE VEHÍCULOS (RUTAS PREFIJO /ADMIN)
  // =========================================================================

  //Ruta: POST /api/admin/vehiculos

  altaVehiculo(vehiculo: { marca: string; modelo: string; color: string; patente: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/admin/vehiculos`, vehiculo);
  }

  // Ruta: GET /api/admin/vehiculos
  listarVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/admin/vehiculos`);
  }

  //Ruta: GET /api/admin/vehiculos/:id
  obtenerVehiculoPorId(idVehiculo: number): Observable<any> {
    return this.http.get<any>(`${this.api}/admin/vehiculos/${idVehiculo}`);
  }

  //Ruta: PUT /api/admin/vehiculos/:id/estado
  cambiarEstadoLogicoVehiculoAdmin(idVehiculo: number, activo: boolean): Observable<any> {
    return this.http.put<any>(`${this.api}/admin/vehiculos/${idVehiculo}/estado`, { activo });
  }

  //Ruta: PUT /api/admin/conductoras/aprobar-vehiculo
  gestionarCambioVehiculoAdmin(idSolicitud: number, aprobado: boolean): Observable<any> {
    return this.http.put<any>(`${this.api}/admin/conductoras/aprobar-vehiculo`, { idSolicitud, aprobado });
  }

  // =========================================================================
  // INFORMES Y ESTADÍSTICAS
  // =========================================================================

  //Ruta: GET /api/informe-mensual
  obtenerInformeMensual(mes?: number, anio?: number): Observable<any> {
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes.toString());
    if (anio) params = params.set('anio', anio.toString());

    return this.http.get<any>(`${this.api}/admin/informe-mensual`, { params });
  }
}