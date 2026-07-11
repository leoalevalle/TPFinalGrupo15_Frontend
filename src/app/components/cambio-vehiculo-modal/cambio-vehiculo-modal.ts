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
  mensajeExito = '';

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
        next: (respuesta:any) => {
          this.vehiculos = respuesta.data || respuesta;;
          this.cdr.detectChanges();
        },

        error: err => {
          console.error("error al cargar los vehiculos",err);
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
          this.mensajeExito = "Cambio de vehículo registrado con éxito. Pendiente de aprobación por la Administradora.";
          this.idNuevoVehiculo = 0; 
          this.cdr.detectChanges();
        },

        error: err => {
          console.error("error al solicitar cambio de vehículo",err);
          this.mensajeExito = ''; 
          alert(err.error?.error || 'No se pudo procesar la solicitud.');

        }

      });

  }

}