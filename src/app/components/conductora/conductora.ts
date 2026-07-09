import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JornadaCard } from '../jornada-card/jornada-card';
import { VehiculoCard } from '../vehiculo-card/vehiculo-card';
import { CambioVehiculoModal } from '../cambio-vehiculo-modal/cambio-vehiculo-modal';
import { AuthService } from '../../services/auth.service';
import { ConductoraService } from '../../services/conductora.service';

@Component({
  selector: 'app-conductora',
  standalone: true,
  imports: [CommonModule, JornadaCard, VehiculoCard, CambioVehiculoModal],
  templateUrl: './conductora.html',
  styleUrl: './conductora.css',
})
export class Conductora {

  conductora:any;
  propuesta: any=null;
  viajeActivo: any = null;
  resumenDiario: any = null;
  pestanaActiva: string = 'vehiculo';

  constructor(
    private authService: AuthService, 
    private conductoraService: ConductoraService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(){

    const usuario=this.authService.getUser();

    this.conductoraService
        .obtenerConductora(usuario.idUsuario)
        .subscribe(res=>{

              this.conductora=res;
              this.cdr.detectChanges();

        });
    this.obtPropuesta();
  }

  obtPropuesta() {
    this.conductoraService.obtenerPropuesta().subscribe(res => {
      console.log("Propuesta detectada en componente:", res);

      if (res && (res.idSolicitud || res.id || res.origen)) {
        this.propuesta = { ...res }; 
        console.log("Variable 'this.propuesta' asignada con éxito:", this.propuesta);
      } else {
        this.propuesta = null;
        console.log("No se detectó una propuesta válida, seteado en null.");
      }
      
      this.cdr.detectChanges();
    }, error => {
      console.error("Error obteniendo propuesta:", error);
    });
  }

  responder(aceptar: boolean) {
    if (!this.propuesta) return;

    this.conductoraService.responderPropuesta(this.propuesta.idSolicitud, aceptar).subscribe(res => {
      this.propuesta = null; 
      this.cdr.detectChanges();
    }, error => {
      alert("Error al responder la propuesta: " + error.error.error);
    });
  }

  llegueAlOrigen() {
    if (!this.viajeActivo) return;
    this.conductoraService.llegarOrigen(this.viajeActivo.idViaje).subscribe({
      next: (res) => {
        this.viajeActivo.estadoViaje = 'En Origen';
        this.cdr.detectChanges();
      },
      error: (err) => alert(err.error.error)
    });
  }

  iniciarTraslado() {
    if (!this.viajeActivo) return;
    this.conductoraService.iniciarViaje(this.viajeActivo.idViaje).subscribe({
      next: (res) => {
        this.viajeActivo.estadoViaje = 'En Viaje';
        this.cdr.detectChanges();
      },
      error: (err) => alert(err.error.error)
    });
  }

  finalizarViaje() {
    if (!this.viajeActivo) return;
    this.conductoraService.finalizarViaje(this.viajeActivo.idViaje).subscribe({
      next: (res) => {
        alert(`Viaje Finalizado. Monto a cobrar: $${res.viaje.monto}`);
        this.viajeActivo = null;
        this.obtenerGananciasDelDia();
        this.cdr.detectChanges();
      },
      error: (err) => alert(err.error.error)
    });
  }

  obtenerGananciasDelDia() {
    this.conductoraService.obtenerResumenDiario().subscribe({
      next: (res) => {
        this.resumenDiario = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al obtener resumen:', err)
    });
  }
}
