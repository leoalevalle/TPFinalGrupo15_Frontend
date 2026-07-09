import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core'; 
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
export class Conductora implements OnInit, OnDestroy {

  conductora: any;
  propuesta: any = null; 
  viajeActivo: any = null;
  resumenDiario: any = null;
  pestanaActiva: string = 'vehiculo';
  monto: any = null;
  private refreshInterval: any;

  constructor(
    private authService: AuthService, 
    private conductoraService: ConductoraService, 
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUser();
    this.conductoraService
        .obtenerConductora(usuario.idUsuario)
        .subscribe(res => {
              this.conductora = res;
              this.cdr.detectChanges();
        });

    this.consultarPanelEnVivo();
    this.obtenerGananciasDelDia();

    this.refreshInterval = setInterval(() => {
      this.zone.run(() => {
        this.consultarPanelEnVivo();
      });
    }, 5000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  consultarPanelEnVivo() {
    this.conductoraService.obtenerViajeActivo().subscribe({
      next: (viaje) => {
        if (viaje) {
          this.viajeActivo = viaje;
          this.propuesta = null;
          this.cdr.detectChanges();
        } else {
          this.viajeActivo = null;

          this.conductoraService.obtenerPropuesta().subscribe({
            next: (solicitud) => {
              if (solicitud) {
                this.propuesta = solicitud;
              } else if (this.propuesta && this.propuesta.estado === 'Aceptada') {
                console.log("Manteniendo cartel de 'Esperando despacho' en el frontend");
              } else {
                this.propuesta = null;
              }
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error("Error al obtener solicitud:", err);
              if (!(this.propuesta && this.propuesta.estado === 'Aceptada')) {
                this.propuesta = null;
              }
              this.cdr.detectChanges();
            }
          });
        }
      },
      error: (err) => console.error("Error al obtener viaje activo:", err)
    });
  }

  responder(aceptar: boolean) {
    if (!this.propuesta) return;
    
    if (aceptar) {
      this.propuesta.estado = 'Aceptada';
      this.cdr.detectChanges();
    }

    this.conductoraService.responderPropuesta(this.propuesta.idSolicitud, aceptar).subscribe({
      next: (res) => {
        if (!aceptar) {
          this.propuesta = null;
        }
        this.consultarPanelEnVivo();
        this.monto = 0;
      },
      error: (error) => {
        console.log("Error al responder la propuesta: " + error.error.error);
        this.consultarPanelEnVivo(); 
      }
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
        this.monto = res.viaje.monto;
        this.viajeActivo = null;
        this.propuesta = null;
        
        this.zone.run(() => {
          this.obtenerGananciasDelDia();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
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