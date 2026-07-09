import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ConductoraService } from '../../services/conductora.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cambio-vehiculo-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './cambio-vehiculo-modal.html',
  styleUrl: './cambio-vehiculo-modal.css'
})
export class CambioVehiculoModal implements OnInit {

  @Input() conductoraInfo: any;
  usuario: any;
  vehiculos: any[] = [];
  idNuevoVehiculo: number = 0;
  mensaje = '';

  constructor(
    private conductoraService: ConductoraService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {

    this.usuario = this.authService.getUser();
    this.cargarVehiculos();
  }

  cargarVehiculos() {

    this.conductoraService.listarVehiculos()
      .subscribe({
        next: (data:any) => {
          this.vehiculos = data;
          this.cdr.detectChanges();
        },

        error: err => {
          console.error(err);
        }

      });

  }

  solicitarCambio() {

    const datos = {
      idConductora: this.usuario.idUsuario,
      idNuevoVehiculo: this.idNuevoVehiculo

    };

    this.conductoraService
      .solicitarCambioVehiculo(datos)
      .subscribe({

        next: (respuesta:any) => {
          this.mensaje = respuesta.message;
          alert(this.mensaje);
          this.cdr.detectChanges();
        },

        error: err => {
          console.error(err);
          alert(err.error.error);

        }

      });

  }

}