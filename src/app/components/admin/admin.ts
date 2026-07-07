import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdministracionService } from '../../services/administracion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  
  // Listados locales para renderizar en las tablas
  vehiculos: any[] = [];
  
  // Variables para el formulario de Alta de Vehículo
  nuevoVehiculo = {
    marca: '',
    modelo: '',
    color: '',
    patente: ''
  };

  // Variables para filtros del informe mensual
  mesFiltro: number = new Date().getMonth() + 1;
  anioFiltro: number = new Date().getFullYear();
  informeData: any = null;

  constructor(private adminService: AdministracionService) {}

  ngOnInit(): void {
    this.cargarVehiculos();
    this.obtenerInforme();
  }

  // =========================================================================
  // MÉTODOS DE CONSULTA (GET)
  // =========================================================================
  cargarVehiculos() {
    this.adminService.listarVehiculos().subscribe({
      next: (res) => this.vehiculos = res,
      error: (err) => console.error('Error al listar vehículos', err)
    });
  }

  obtenerInforme() {
    this.adminService.obtenerInformeMensual(this.mesFiltro, this.anioFiltro).subscribe({
      next: (res) => {
        this.informeData = res.data;
      },
      error: (err) => console.error('Error al obtener informe', err)
    });
  }

  // =========================================================================
  // GESTIÓN DE USUARIOS / PASAJERAS / CONDUCTORAS
  // =========================================================================
  
  // Sirve para banear o activar a cualquier usuario (idUsuario)
  alterarEstadoUsuario(idUsuario: number, estadoActual: boolean) {
    const accion = estadoActual ? 'desactivar/banear' : 'activar';
    
    Swal.fire({
      title: `¿Estás seguro de ${accion} este usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.cambiarEstadoLogicoUsuario(idUsuario, !estadoActual).subscribe({
          next: () => {
            Swal.fire('¡Éxito!', `El usuario ha sido modificado.`, 'success');
            // Aquí podrías recargar la lista de usuarios si tuvieras una
          },
          error: (err) => Swal.fire('Error', 'No se pudo cambiar el estado.', 'error')
        });
      }
    });
  }

  evaluarPasajera(idPasajera: number, aprobar: boolean) {
    Swal.fire({
      title: aprobar ? '¿Aprobar registro de pasajera?' : '¿Rechazar registro?',
      input: aprobar ? undefined : 'text', // Si rechaza, pide motivo
      inputLabel: aprobar ? undefined : 'Motivo del rechazo',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.isConfirmed) {
        const datos = {
          aprobado: aprobar,
          observaciones: result.value || (aprobar ? 'Registro aprobado por auditoría' : 'No cumple requisitos')
        };

        this.adminService.evaluarRegistroPasajera(idPasajera, datos).subscribe({
          next: () => Swal.fire('Procesado', 'La pasajera fue evaluada con éxito.', 'success'),
          error: (err) => Swal.fire('Error', 'No se pudo evaluar el registro.', 'error')
        });
      }
    });
  }

  evaluarConductora(idConductora: number, aprobar: boolean) {
    Swal.fire({
      title: aprobar ? '¿Habilitar conductora para trabajar?' : '¿Rechazar conductora?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.evaluarRegistroConductora(idConductora, { aprobado: aprobar }).subscribe({
          next: () => Swal.fire('Habilitación Actualizada', 'Cambio registrado en la ficha de la conductora.', 'success'),
          error: (err) => Swal.fire('Error', 'Fallo en la evaluación.', 'error')
        });
      }
    });
  }

  // =========================================================================
  // GESTIÓN DE VEHÍCULOS
  // =========================================================================
  registrarVehiculo() {
    this.adminService.altaVehiculo(this.nuevoVehiculo).subscribe({
      next: (res) => {
        Swal.fire('Vehículo Registrado', 'El coche se añadió a la flota con éxito.', 'success');
        this.cargarVehiculos(); // Recargamos la tabla
        this.nuevoVehiculo = { marca: '', modelo: '', color: '', patente: '' }; // Limpiamos formulario
      },
      error: (err) => Swal.fire('Error', 'No se pudo crear el vehículo. Verifique los datos.', 'error')
    });
  }

  cambiarEstadoVehiculo(idVehiculo: number, estadoActual: boolean) {
    this.adminService.cambiarEstadoLogicoVehiculoAdmin(idVehiculo, !estadoActual).subscribe({
      next: () => {
        Swal.fire('Estado Actualizado', 'El vehículo cambió su disponibilidad.', 'success');
        this.cargarVehiculos();
      },
      error: (err) => Swal.fire('Error', 'No se pudo actualizar el coche.', 'error')
    });
  }

  aprobarCambioCocheChofer(idSolicitud: number, aprobado: boolean) {
    this.adminService.gestionarCambioVehiculoAdmin(idSolicitud, aprobado).subscribe({
      next: () => {
        Swal.fire('Solicitud de Cambio Cerrada', aprobado ? 'Vehículo asignado a la chofer.' : 'Cambio rechazado.', 'success');
        this.cargarVehiculos(); // Refrescar flota por si cambiaron asociaciones
      },
      error: (err) => Swal.fire('Error', 'No se pudo procesar la solicitud del coche.', 'error')
    });
  }
}
