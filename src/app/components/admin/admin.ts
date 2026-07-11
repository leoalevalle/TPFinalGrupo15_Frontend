import { Component, OnInit, ElementRef, viewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdministracionService } from '../../services/administracion.service';
import Swal from 'sweetalert2';
import {jsPDF} from 'jspdf';
import {Chart, registerables} from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {

  chartInstance: any = null
  graficoCanvas = viewChild<ElementRef>('graficoCanvas');

  // Listados locales para renderizar en las tablas
  vehiculos: any[] = [];
  solicitudesPendientes: any[] = [];
  todasLasConductoras: any[] = []; 
  conductorasVisibles: any[] = [];
  solicitudesCambioVehiculo: any[] = [];
  listaPasajeras: any[] = [];

  terminoBusqueda: string = '';  
  filtroActivo: boolean = false;
  
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
    this.exportarPDF();
    this.cargarSolicitudes();
    this.cargarCambiosVehiculo();
    this.cargarPasajeras();
  }

  // =========================================================================
  // MÉTODOS DE CONSULTA (GET)
  // =========================================================================
  cargarSolicitudes(): void {
    this.terminoBusqueda = ''; 
    this.adminService.getSolicitudesAlta().subscribe({
      next: (res: any) => {
        console.log('Datos que trae el back para las conductoras:', res); 
        
        if (res && res.status === '1') {
          this.solicitudesPendientes = res.data;
          this.filtrarConductoras();
        }
      },
      error: (err) => console.error('Error al cargar solicitudes de conductoras', err)
    });
  }

  filtrarConductoras(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    if (termino === '') {
      this.conductorasVisibles = this.solicitudesPendientes.filter(
        cond => cond.aprobadaPorAdmin === false
      );
    } else {
        this.conductorasVisibles = this.solicitudesPendientes.filter(cond => {
        return (
          cond.nombre?.toLowerCase().includes(termino) ||
          cond.email?.toLowerCase().includes(termino)
        );
      });
    }
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.filtrarConductoras();
  }

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
        setTimeout(() => this.inicializarGrafico(), 50);
      },
      error: (err) => console.error('Error al obtener informe', err)
    });
  }
  inicializarGrafico() {
    if (!this.informeData || !this.graficoCanvas) return;

    // Si ya existía un gráfico anterior (por ejemplo, de otro mes), lo destruimos para que no se superponga
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.graficoCanvas()?.nativeElement.getContext('2d');
    
    this.chartInstance = new Chart(ctx, {
      type: 'pie', // Puede ser 'pie', 'bar', o 'line'
      data: {
        labels: ['Completados', 'Cancelados'],
        datasets: [{
          data: [this.informeData.serviciosCompletados, this.informeData.serviciosCancelados],
          backgroundColor: ['#198754', '#ffc107'], // Verde y Amarillo Bootstrap
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  exportarPDF(): void {
    if (!this.informeData) return;

    // 1. Instanciamos jsPDF (Formato A4, unidad en milímetros)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 2. Colores institucionales (Estilo Dark / Slate corporativo)
    const colorPrimario = '#212529'; // Gris oscuro Bootstrap
    const colorTexto = '#333333';
    const colorSeparador = '#cccccc';

    // 3. ENCABEZADO / MEMBRETE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(colorPrimario);
    doc.text('SISTEMA OPERATIVO DE TRANSPORTE', 20, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#777777');
    doc.text('Panel de Control de Administración', 20, 31);

    // Fecha de emisión del PDF a la derecha
    const fechaEmision = new Date().toLocaleDateString('es-AR');
    doc.text(`Fecha Emisión: ${fechaEmision}`, 145, 31);

    // Línea divisoria elegante
    doc.setDrawColor(colorSeparador);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // 4. TÍTULO DEL INFORME
    const mesesNombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const nombreMes = mesesNombres[this.mesFiltro - 1];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorPrimario);
    doc.text(`REPORTE OPERACIONAL MENSUAL - ${nombreMes.toUpperCase()} ${this.anioFiltro}`, 20, 48);

    // 5. GRILLA / TABLA DE MÉTRICAS ANALÍTICAS
    let f = 60; // Variable que maneja la coordenada Vertical (Y)

    // Fila 1: Total de viajes procesados en el período
    doc.setFillColor('#f8f9fa');
    doc.rect(20, f, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colorTexto);
    doc.text('Total de Viajes en el Período:', 25, f + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.informeData.totalViajesPeriodo || (this.informeData.serviciosCompletados + this.informeData.serviciosCancelados)}`, 140, f + 6.5);

    // Fila 2: Viajes Completados con Éxito
    f += 12;
    doc.setFillColor('#ffffff');
    doc.rect(20, f, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Servicios Completados:', 25, f + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#198754'); // Verde éxito
    doc.text(`${this.informeData.serviciosCompletados}`, 140, f + 6.5);

    // Fila 3: Viajes Cancelados
    f += 12;
    doc.setFillColor('#f8f9fa');
    doc.rect(20, f, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorTexto);
    doc.text('Servicios Cancelados:', 25, f + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#ffc107'); // Amarillo/Naranja warning
    doc.text(`${this.informeData.serviciosCancelados}`, 140, f + 6.5);

    // Fila 4: Recaudación Monetaria (Destacada)
    f += 15;
    doc.setFillColor('#e7f1ff'); // Celeste suave de Bootstrap
    doc.rect(20, f, 170, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#0d6efd'); // Azul primario
    doc.text('RECAUDACIÓN TOTAL DEL MES:', 25, f + 7.5);
    doc.text(`$${this.informeData.recaudacionTotal}`, 140, f + 7.5);

    // 6. PIE DE PÁGINA / CONTROL DE AUDITORÍA
    doc.setDrawColor(colorSeparador);
    doc.setLineWidth(0.3);
    doc.line(20, 265, 190, 265);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor('#999999');
    doc.text('Documento de carácter interno generado automáticamente por la plataforma.', 20, 272);
    doc.text('Fin del informe.', 167, 272);

    // 7. DISPARAR DESCARGA EN EL NAVEGADOR
    const nombreArchivo = `Informe_${this.mesFiltro}_${this.anioFiltro}.pdf`;
    doc.save(nombreArchivo);

    if (this.chartInstance) {
      const graficoImgBase64 = this.chartInstance.toBase64Image();
      
      // Añadimos un título chiquito para el gráfico en el PDF
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(colorTexto);
      doc.text('Distribución porcentual de servicios:', 25, f + 22);

      // Pegamos la imagen del gráfico (Coordenadas: X=65mm, Y=f+26mm, Ancho=70mm, Alto=70mm)
      doc.addImage(graficoImgBase64, 'PNG', 65, f + 26, 70, 70);
    }
  }

  // =========================================================================
  // GESTIÓN DE USUARIOS / PASAJERAS / CONDUCTORAS
  // =========================================================================
  cargarPasajeras() {
    this.adminService.obtenerPasajeras().subscribe({
      next: (res) => this.listaPasajeras = res.data,
      error: (err) => console.error('Error al cargar pasajeras', err)
    });
  }
  evaluarPasajera(pasajera: any, aprobar: boolean) {
    this.adminService.evaluarPasajera(pasajera.idUsuario, aprobar).subscribe({
      next: (res) => {
        pasajera.aprobadaPorAdmin = aprobar; // Reflejo inmediato en la pantalla
      },
      error: (err) => alert(err.error?.msg || 'Error al evaluar')
    });
  }
  alternarBaneoPasajera(pasajera: any, estadoActivo: boolean) {
    this.adminService.cambiarEstadoUsuario(pasajera.idUsuario, estadoActivo).subscribe({
      next: (res) => {
        pasajera.activo = estadoActivo; // Reflejo inmediato en la pantalla
      },
      error: (err) => console.error(err)
    });
  }
  
  // =========================================================================
  // GESTIÓN Y EVALUACIÓN DE CONDUCTORAS
  // =========================================================================
  evaluarConductora(conductora: any, aprobar: boolean): void {
    const accion = aprobar ? 'habilitar' : 'rechazar';
    
    Swal.fire({
      title: aprobar ? '¿Habilitar conductora para trabajar?' : '¿Rechazar conductora?',
      text: aprobar 
        ? `Esto cambiará el estado de ${conductora.nombre} a Activo y podrá loguearse.` 
        : `Se marcará la solicitud de ${conductora.nombre} como rechazada de forma visual.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: aprobar ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: aprobar ? 'Sí, habilitar' : 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        
        this.adminService.evaluarRegistroConductora(conductora.idUsuario, aprobar).subscribe({
          next: (res: any) => {
            Swal.fire('¡Logrado!', res.msg || 'Cambio registrado con éxito.', 'success');
            if (aprobar) {
              conductora.activo = true;
              conductora.aprobadaPorAdmin = true;
            } else {
              conductora.activo = false;
              conductora.aprobadaPorAdmin = true;
            }
            this.filtrarConductoras();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.msg || 'No se pudo procesar la evaluación.', 'error');
          }
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

  cargarCambiosVehiculo(): void {
    this.adminService.getCambiosVehiculoPendientes().subscribe({
      next: (res: any) => {
        if (res && res.status === '1') {
          this.solicitudesCambioVehiculo = res.data;
        }
      },
      error: (err) => console.error('Error al obtener solicitudes de cambio de coche', err)
    });
  }

  evaluarCambioVehiculo(conductora: any, autorizar: boolean): void {
    const datosEnvio = {
      idConductora: conductora.idUsuario,
      idVehiculo: conductora.idVehiculoSolicitado,
      autorizar: autorizar
    };

    this.adminService.gestionarCambioVehiculo(datosEnvio).subscribe({
      next: (res: any) => {
        Swal.fire('¡Procesado!', res.message || 'Cambio registrado.', 'success');
        
        this.cargarCambiosVehiculo();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'No se pudo procesar el cambio.', 'error');
      }
    });
  }
}
