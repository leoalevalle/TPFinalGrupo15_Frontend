import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo } from '../models/vehiculo'; 

@Injectable({
  providedIn: 'root',
})
export class ConductoraService {

  private api="http://localhost:3000/api";
  constructor(private http:HttpClient){} 
      
  iniciarJornada(data:any){
      return this.http.put(
           `${this.api}/conductoras/jornada/inicio`,
          data
      );
  } 

  finalizarJornada(data:any){
      return this.http.put(
         this.api+"/conductoras/jornada/fin",
         data
      );
  } 

  obtenerConductora(id: number) {
      return this.http.get<any>(
        `${this.api}/conductoras/${id}`
      );
  } 

  obtenerVehiculo(id: number) {
      return this.http.get<any>(
         `http://localhost:3000/api/admin/vehiculos/${id}`
      );
  }

  solicitarCambioVehiculo(data:any){
      return this.http.post(
         'http://localhost:3000/api/conductoras/cambio-vehiculo',
         data
      );
  } 

  listarConductoras(){
      return this.http.get(
         'http://localhost:3000/api/conductores'
      );
  }

  listarVehiculos(){
      return this.http.get(
         'http://localhost:3000/api/admin/vehiculos'
      );
  } 

  obtenerPropuesta(): Observable<any> {
    return this.http.get<any>(`${this.api}/transaccion/conductoras/solicitudes/propuesta`);
  }

  obtenerViajeActivo(): Observable<any> {
    return this.http.get<any>(`${this.api}/transaccion/conductoras/viajes/activo`);
  }

  responderPropuesta(idSolicitud: number, aceptar: boolean): Observable<any> {
    return this.http.put<any>(`${this.api}/transaccion/conductoras/solicitudes/${idSolicitud}/responder`, { aceptar });
  }

  llegarOrigen(idViaje: number): Observable<any> {
    return this.http.put<any>(`${this.api}/transaccion/viajes/${idViaje}/llegue_origen`, {});
  }

  iniciarViaje(idViaje: number): Observable<any> {
    return this.http.put<any>(`${this.api}/transaccion/viajes/${idViaje}/inicio-viaje`, {});
  }

  finalizarViaje(idViaje: number): Observable<any> {
    return this.http.put<any>(`${this.api}/transaccion/viajes/${idViaje}/finalizar`, {});
  }

  cancelarViaje(idViaje: number): Observable<any> {
    return this.http.put<any>(`${this.api}/transaccion/viajes/${idViaje}/cancelar`, {});
  }

  obtenerResumenDiario(): Observable<any> {
    return this.http.get<any>(`${this.api}/transaccion/conductoras/resumen`);
  }

  confirmarPagoEfectivo(idViaje: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put<any>(`${this.api}/transaccion/viajes/confirmar-efectivo`, { idViaje }, { headers });
  }

  confirmarPagoMercadoPago(idViaje: number, monto: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post<any>(`${this.api}/transaccion/viajes/${idViaje}/crear-preferencia-mp`, { monto }, { headers });
  }

  obtenerDetalleViajeCompleto(idViaje: number): Observable<any> {
    return this.http.get<any>(
      `${this.api}/transaccion/viajes/${idViaje}/detalle-completo`
    );
  }
  
  registrarPagoMercadoPago(idViaje: number, paymentId: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.put(
      `${this.api}/transaccion/viajes/confirmar-mercadopago`,
      {
        idViaje,
        paymentId
      },
      { headers }
    );
  }
  
}