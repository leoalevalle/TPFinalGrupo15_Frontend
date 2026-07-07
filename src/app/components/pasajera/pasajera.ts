import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
import { PasajeraService } from '../../services/pasajera.service';
import { Solicitud } from '../../models/solicitud';

const STORAGE_KEY = 'solicitudActual';

@Component({
  selector: 'app-pasajera',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pasajera.html',
  styleUrl: './pasajera.css',
})
export class Pasajera implements OnInit {
  usuario: any;
  solicitudForm!: FormGroup;
  solicitudActual: Solicitud | null = null;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private pasajeraService: PasajeraService,
  ) {
    this.solicitudForm = this.fb.group({
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      zona: ['', Validators.required],
      cantPasajeros: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
    });
  }

  ngOnInit(): void {
    this.usuario = this.authService.getUser();

    //última solicitud local mientras no exista GET en el back
    const guardada = localStorage.getItem(STORAGE_KEY);
    if (guardada) {
      this.solicitudActual = JSON.parse(guardada);
    }
  }

  get f() {
    return this.solicitudForm.controls;
  }

  solicitarViaje() {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }
    const datos = {
      idPasajera: this.usuario.idUsuario,
      ...this.solicitudForm.value,
    };

    this.cargando = true;

    this.pasajeraService.crearSolicitud(datos).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;
        this.solicitudActual = respuesta;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(respuesta));

        Swal.fire({
          icon: 'success',
          title: 'Solicitud enviada',
          text: 'Buscando una conductora disponible...',
        });

        this.solicitudForm.reset({ cantPasajeros: 1 });
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo solicitar el viaje',
          text: err.error?.error || 'Intentá nuevamente',
        });
      },
    });
  }

  cancelarSolicitud() {
    if (!this.solicitudActual) return;

    Swal.fire({
      icon: 'warning',
      title: '¿Cancelar solicitud?',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.pasajeraService.cancelarSolicitud(this.solicitudActual!.idSolicitud).subscribe({
        next: () => {
          Swal.fire('Cancelada', 'Tu solicitud fue cancelada.', 'success');
          this.solicitudActual = null;
          localStorage.removeItem(STORAGE_KEY);
        },
        error: (err) => {
          Swal.fire('Error', err.error?.error || 'No se pudo cancelar', 'error');
        },
      });
    });
  }

  get puedeCancelar(): boolean {
    return (
      !!this.solicitudActual &&
      ['Pendiente', 'Propuesta', 'Aceptada'].includes(this.solicitudActual.estado)
    );
  }
}
