import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
import { PasajeraService } from '../../services/pasajera.service';
import { Solicitud } from '../../models/solicitud';
import { GeocodingService } from '../../services/geocoding.service'

import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const STORAGE_KEY = 'solicitudActual';

@Component({
  selector: 'app-pasajera',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pasajera.html',
  styleUrl: './pasajera.css',
})
export class Pasajera implements OnInit, OnDestroy {
  usuario: any;
  solicitudForm!: FormGroup;
  cargando: boolean = false;
  
  // Guardará la solicitud activa que viene del backend o null si no hay viaje
  solicitudActual: any = null; 
  
  // Suscripción para el monitoreo en tiempo real
  private miSubscripcion!: Subscription;

  constructor(
    private fb: FormBuilder,
    private transaccionService: PasajeraService,
    private geocodingService: GeocodingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUser();
    this.inicializarFormulario();
    this.detectarUbicacionInicial();
  }

  inicializarFormulario() {
    this.solicitudForm = this.fb.group({
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      zona: ['', Validators.required],
      cantPasajeros: [1, [Validators.required, Validators.min(1), Validators.max(4)]]
    });
  }

  // Getter rápido para las validaciones del HTML (el f['origen'] que pusiste)
  get f() {
    return this.solicitudForm.controls;
  }

  // Getter dinámico para habilitar/deshabilitar el botón de cancelar
  get puedeCancelar(): boolean {
    if (!this.solicitudActual) return false;
    const estado = this.solicitudActual.estado;
    // Se puede cancelar si está Pendiente o en Propuesta (antes de que la chofer acepte)
    return estado === 'Pendiente' || estado === 'Propuesta';
  }

  detectarUbicacionInicial() {

  if (!navigator.geolocation) {
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    this.geocodingService.obtenerUbicacion(lat, lng).subscribe({

      next: (ubicacion) => {

        this.solicitudForm.patchValue({

          origen: ubicacion.origen,

          zona: ubicacion.zona

        });

      },

      error: (err) => console.error(err)

    });

  });

  }

  solicitarViaje() {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    const datosInyeccion = {
      idPasajera: this.usuario?.idUsuario,
      origen: this.solicitudForm.value.origen,
      destino: this.solicitudForm.value.destino,
      // Podés mandar zona y pasajeros si tu backend los recibe
      zona: this.solicitudForm.value.zona, 
      cantPasajeros: this.solicitudForm.value.cantPasajeros
    };

    this.transaccionService.crearSolicitudViaje(datosInyeccion).subscribe({
      next: (res) => {
        this.cargando = false;
        // Simulamos la estructura inicial según tu HTML
        this.solicitudActual = {
          idSolicitud: res.idSolicitud,
          origen: datosInyeccion.origen,
          destino: datosInyeccion.destino,
          zona: datosInyeccion.zona,
          cantPasajeros: datosInyeccion.cantPasajeros,
          estado: 'Pendiente' // Arranca pendiente de asignación
        };
        
        Swal.fire('¡Pedido Registrado!', 'Buscando conductoras disponibles...', 'success');
        this.comenzarMonitoreo();
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudo procesar la solicitud del viaje.', 'error');
      }
    });
  }

  comenzarMonitoreo() {
    // Polling cada 4 segundos para actualizar la card del viaje automáticamente
    this.miSubscripcion = interval(4000).pipe(
      // Cambiá este método por el que use tu backend para traer una solicitud por ID
      switchMap(() => this.transaccionService.listarSolicitudesPendientes()) 
    ).subscribe({
      next: (listaSolicitudes) => {
        // Buscamos si nuestra solicitud cambió de estado en la base de datos
        const miSolicitudServer = listaSolicitudes.find(s => s.idSolicitud === this.solicitudActual.idSolicitud);
        
        if (miSolicitudServer) {
          // Actualiza 'Pendiente', 'Propuesta', 'Aceptada', 'Cancelada' o 'Rechazada'
          this.solicitudActual.estado = miSolicitudServer.estado; 
          
          if (this.solicitudActual.estado === 'Aceptada') {
            Swal.fire('¡Viaje Confirmado!', 'Tu conductora aceptó el viaje y va en camino.', 'success');
          }
        }
      },
      error: (err) => console.error('Error en sincronización', err)
    });
  }

  cancelarSolicitud() {
    Swal.fire({
      title: '¿Deseas cancelar el viaje?',
      text: 'Esta acción notificará a la central.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48', // Color Pink/Rosa corporativo
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.transaccionService.cancelarSolicitud(this.solicitudActual.idSolicitud).subscribe({
          next: () => {
            Swal.fire('Cancelado', 'Tu solicitud fue dada de baja.', 'info');
            this.detenerMonitoreo();
            this.solicitudActual = null; // Volvemos a mostrar el formulario de pedido
            this.solicitudForm.patchValue({ destino: '' }); // Reseteamos solo el destino anterior
          },
          error: (err) => Swal.fire('Error', 'No se pudo cancelar el viaje.', 'error')
        });
      }
    });
  }

  private detenerMonitoreo() {
    if (this.miSubscripcion) {
      this.miSubscripcion.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.detenerMonitoreo();
  }
}