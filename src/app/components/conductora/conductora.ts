import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JornadaCard } from '../jornada-card/jornada-card';
import { VehiculoCard } from '../vehiculo-card/vehiculo-card';
import { CambioVehiculoModal } from '../cambio-vehiculo-modal/cambio-vehiculo-modal';
import { AuthService } from '../../services/auth.service';
import { ConductoraService } from '../../services/conductora';

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

      // Flexibilizamos la condición: si 'res' existe y tiene CUALQUIER propiedad de id, lo guardamos
      if (res && (res.idSolicitud || res.id || res.origen)) {
        // Clonamos el objeto usando el operador spread (...) para forzar a Angular a romper la referencia
        this.propuesta = { ...res }; 
        console.log("Variable 'this.propuesta' asignada con éxito:", this.propuesta);
      } else {
        this.propuesta = null;
        console.log("No se detectó una propuesta válida, seteado en null.");
      }
      
      // Forzamos manualmente el renderizado del *ngIf="propuesta"
      this.cdr.detectChanges();
    }, error => {
      console.error("Error obteniendo propuesta:", error);
    });
  }
  // 🔥 NUEVO: Envía la decisión a la API y limpia la pantalla
  responder(aceptar: boolean) {
    if (!this.propuesta) return;

    this.conductoraService.responderPropuesta(this.propuesta.idSolicitud, aceptar).subscribe(res => {
      alert(aceptar ? "¡Viaje aceptado! Dirígete al origen." : "Propuesta rechazada con éxito.");
      this.propuesta = null; // Limpiamos la propuesta de la pantalla
      this.cdr.detectChanges();
    }, error => {
      alert("Error al responder la propuesta: " + error.error.error);
    });
  }
}
