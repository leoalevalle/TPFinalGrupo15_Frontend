import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  responderPropuesta(idSolicitud: number, aceptar: boolean): Observable<any> {
      return this.http.put<any>(`${this.api}/transaccion/conductoras/solicitudes/${idSolicitud}/responder`, { aceptar });
  }

  llegarOrigen(idViaje: number): Observable<any> {
    return this.http.patch(`${this.api}/transaccion/viajes/${idViaje}/llegue_origen`, {});
  }

  iniciarViaje(idViaje: number): Observable<any> {
    return this.http.put<any>(`${this.api}/transaccion/viajes/${idViaje}/iniciar`,{});
  }

  finalizarViaje(idViaje: number): Observable<any> {
    return this.http.put<any>(`${this.api}/transaccion/viajes/${idViaje}/finalizar`,{});
  }

  obtenerResumenDiario(): Observable<any> {
    return this.http.get(`${this.api}/transaccion/conductoras/resumen`);
  }
}


