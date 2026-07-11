import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
import { OperadoraService } from '../../services/operadora.service';
import { Solicitud } from '../../models/solicitud';
import { Viaje } from '../../models/viaje';
import { Usuario } from '../../models/usuario';

const STORAGE_PROPUESTAS = 'operadora_propuestas';
const STORAGE_VIAJES = 'operadora_viajes';

type TabOperadora = 'pendientes' | 'propuestas' | 'viajes';

interface PropuestaEnCurso {
  solicitud: Solicitud;
  conductora: Usuario;
  patente: string;
}

@Component({
  selector: 'app-operadora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operadora.html',
  styleUrl: './operadora.css',
})
export class Operadora implements OnInit {
  usuario!: Usuario;
  tabActiva: TabOperadora = 'pendientes';

  // ---- Pendientes ----
  solicitudesPendientes: Solicitud[] = [];
  cargandoPendientes = false;

  // ---- Búsqueda de conductora para una solicitud puntual ----
  solicitudExpandidaId: number | null = null;
  conductorasEncontradas: Usuario[] = [];
  buscandoConductoras = false;

  // ---- Propuestas enviadas, esperando aceptación de la conductora ----
  propuestasEnCurso: PropuestaEnCurso[] = [];

  // ---- Viajes ya iniciados ----
  viajesEnCurso: Viaje[] = [];

  constructor(
    private authService: AuthService,
    private operadoraService: OperadoraService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUser();
    this.cargarEstadoLocal();
    this.cargarPendientes(this.usuario.idUsuario);
    this.cdr.detectChanges();
  }

  // ================== NAVEGACIÓN DE TABS ==================
  cambiarTab(tab: TabOperadora) {
    this.tabActiva = tab;
    if (tab === 'pendientes') this.cargarPendientes(this.usuario.idUsuario);
  }

  getTotalPendientes(): number {
    return this.solicitudesPendientes.length;
  }

  getTotalPropuestas(): number {
    return this.propuestasEnCurso.length;
  }

  getTotalViajes(): number {
    return this.viajesEnCurso.length;
  }

  // ================== ESTADO LOCAL (persistencia mientras el back no tiene endpoint de estado) ==================
  private cargarEstadoLocal() {
    const propuestas = localStorage.getItem(STORAGE_PROPUESTAS);
    if (propuestas) this.propuestasEnCurso = JSON.parse(propuestas);

    const viajes = localStorage.getItem(STORAGE_VIAJES);
    if (viajes) this.viajesEnCurso = JSON.parse(viajes);
  }

  private guardarPropuestas() {
    localStorage.setItem(STORAGE_PROPUESTAS, JSON.stringify(this.propuestasEnCurso));
  }

  private guardarViajes() {
    localStorage.setItem(STORAGE_VIAJES, JSON.stringify(this.viajesEnCurso));
  }

  // ================== PENDIENTES ==================
  cargarPendientes(userId: number) {
    this.cargandoPendientes = true;
    this.operadoraService.listarSolicitudesPendientes().subscribe({
      next: (data: Solicitud[]) => {
        this.solicitudesPendientes = data;
        this.cargandoPendientes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoPendientes = false;
        console.error(err);
      },
    });
  }

  toggleBuscarConductoras(solicitud: Solicitud) {
    if (this.solicitudExpandidaId === solicitud.idSolicitud) {
      this.solicitudExpandidaId = null;
      this.conductorasEncontradas = [];
      return;
    }

    this.solicitudExpandidaId = solicitud.idSolicitud;
    this.buscandoConductoras = true;
    this.conductorasEncontradas = [];

    this.operadoraService.conductorasDisponibles(solicitud.zona).subscribe({
      next: (data: Usuario[]) => {
        this.conductorasEncontradas = data;
        this.buscandoConductoras = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.buscandoConductoras = false;
        Swal.fire('Error', 'No se pudieron buscar conductoras.', 'error');
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  proponerConductora(solicitud: Solicitud, conductora: Usuario) {
    this.operadoraService
      .asignarPropuesta({ idSolicitud: solicitud.idSolicitud, idConductora: conductora.idUsuario })
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Propuesta enviada',
            text: `Se le avisó a ${conductora.nombre}. Esperando que acepte.`,
            timer: 2000,
            showConfirmButton: false,
          });

          this.solicitudesPendientes = this.solicitudesPendientes.filter(
            (s) => s.idSolicitud !== solicitud.idSolicitud,
          );
          this.propuestasEnCurso.push({ solicitud, conductora, patente: '' });
          this.guardarPropuestas();

          this.solicitudExpandidaId = null;
          this.conductorasEncontradas = [];
          this.cambiarTab('propuestas');
          this.cdr.detectChanges();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.error || 'No se pudo enviar la propuesta.', 'error');
        },
      });
  }

  iniciales(nombre: string): string {
    if (!nombre) return '?';
    const partes = nombre.trim().split(' ');
    const primera = partes[0]?.[0] || '';
    const segunda = partes[1]?.[0] || '';
    return (primera + segunda).toUpperCase();
  }

  // ================== PROPUESTAS EN CURSO ==================
  registrarViaje(propuesta: PropuestaEnCurso) {
    if (!propuesta.patente || propuesta.patente.trim().length < 5) {
      Swal.fire(
        'Falta la patente',
        'Ingresá la patente del vehículo para iniciar el viaje.',
        'warning',
      );
      return;
    }

    this.operadoraService
      .registrarViaje({
        idSolicitud: propuesta.solicitud.idSolicitud,
        idOperadora: this.usuario.idUsuario,
        patenteVehiculo: propuesta.patente.trim(),
      })
      .subscribe({
        next: (respuesta: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Viaje iniciado',
            text: `${propuesta.conductora.nombre} está en camino.`,
          });

          this.propuestasEnCurso = this.propuestasEnCurso.filter(
            (p) => p.solicitud.idSolicitud !== propuesta.solicitud.idSolicitud,
          );
          this.guardarPropuestas();

          this.viajesEnCurso.push(respuesta.nuevoViaje);
          this.guardarViajes();

          this.cambiarTab('viajes');
          this.cdr.detectChanges();
        },
        error: (err) => {
          Swal.fire(
            'No se pudo iniciar',
            err.error?.error || 'Verificá que la conductora ya haya aceptado la propuesta.',
            'error',
          );
        },
      });
  }

  cancelarPropuestaLocal(propuesta: PropuestaEnCurso) {
    Swal.fire({
      icon: 'question',
      title: '¿Quitar esta propuesta de la lista?',
      text: 'Esto solo la saca de tu panel, no cancela nada en el sistema.',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'No',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.propuestasEnCurso = this.propuestasEnCurso.filter(
        (p) => p.solicitud.idSolicitud !== propuesta.solicitud.idSolicitud,
      );
      this.guardarPropuestas();
      this.cdr.detectChanges();
    });
  }
}
