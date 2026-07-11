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
// 1. Obtener la lista de pasajeras
  obtenerPasajeras(): Observable<any> {
    return this.http.get<any>(`${this.api}/admin/pasajeras`);
  }

  // 2. Aprobar o rechazar admisión (Modifica 'aprobadaPorAdmin')
  evaluarPasajera(id: number, aprobar: boolean): Observable<any> {
    return this.http.put<any>(`${this.api}/admin/pasajeras/${id}/evaluar`, { aprobar });
  }

  // 3. Banear o activar cuenta (Modifica 'activo')
  cambiarEstadoUsuario(id: number, activo: boolean): Observable<any> {
    return this.http.put<any>(`${this.api}/admin/usuarios/${id}/estado`, { activo });
  }

  // Ruta: PUT /api/pasajeras/:id/evaluar
  evaluarRegistroPasajera(idPasajera: number, datosEvaluacion: { aprobado: boolean; observaciones?: string }): Observable<any> {
    return this.http.put<any>(`${this.api}/pasajeras/${idPasajera}/evaluar`, datosEvaluacion);
  }

  // Obtener las conductoras que están esperando aprobación 
  getSolicitudesAlta(): Observable<any> {
    return this.http.get<any>(`${this.api}/admin/solicitudes-alta`);
  }

  evaluarRegistroConductora(idConductora: number, aprobar: boolean): Observable<any> {
    // Mandamos el objeto con la propiedad "aprobar" tal como la pide el controlador
    return this.http.put<any>(`${this.api}/admin/conductoras/${idConductora}/evaluar`, { aprobar });
  }

  // =========================================================================
  // GESTIÓN DE VEHÍCULOS (RUTAS ESTÁNDAR / MIXTAS)
  // =========================================================================

  //Ruta: PUT /api/vehiculos/:id/estado
  cambiarEstadoLogicoVehiculoGenerico(idVehiculo: number, activo: boolean): Observable<any> {
    return this.http.put<any>(`${this.api}/vehiculos/${idVehiculo}/estado`, { activo });
  }

  
  gestionarCambioVehiculo(datos: any): Observable<any> {
    return this.http.put<any>(`${this.api}/admin/conductoras/aprobar-vehiculo`, datos);
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

  getCambiosVehiculoPendientes(): Observable<any> {
    return this.http.get<any>(`${this.api}/admin/cambios-vehiculo-pendientes`);
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