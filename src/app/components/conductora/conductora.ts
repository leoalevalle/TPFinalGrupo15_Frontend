import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { JornadaCard } from '../jornada-card/jornada-card';
import { VehiculoCard } from '../vehiculo-card/vehiculo-card';
import { CambioVehiculoModal } from '../cambio-vehiculo-modal/cambio-vehiculo-modal'; 
import { AuthService } from '../../services/auth.service';
import { ConductoraService } from '../../services/conductora.service';
import { MapaService } from '../../services/mapa.service';
import { GeocodingService } from '../../services/geocoding.service';

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
  private mapaInicializado: boolean = false;
  private idViajeDibujado: string | null = null;
  private tipoServicioDibujado: 'propuesta' | 'activo' | null = null;

  constructor(
    private authService: AuthService, 
    private conductoraService: ConductoraService, 
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private mapaService: MapaService,
    private geocodingService: GeocodingService
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
    }, 10000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  consultarPanelEnVivo() {
    if (this.viajeActivo && this.viajeActivo.estadoViaje === 'Cancelado en Ruta') {
    return; 
    }
    this.conductoraService.obtenerViajeActivo().subscribe({
      next: (viaje) => {
        if (viaje) {
          this.viajeActivo = viaje;
          this.propuesta = null;
          this.cdr.detectChanges();
        } else {
          this.viajeActivo = null;
          this.mapaInicializado = false;

          this.conductoraService.obtenerPropuesta().subscribe({
            next: (solicitud) => {
              if (solicitud) {
                this.propuesta = solicitud;
                this.procesarMapaParaViaje(solicitud);
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

  private procesarMapaParaViaje(datosViaje: any) {
  // 1. Identificamos de manera única este viaje/propuesta
  const idActual = datosViaje.idViaje || datosViaje.idSolicitud || datosViaje.origen + datosViaje.destino;
  const tipoActual = datosViaje.estadoViaje ? 'activo' : 'propuesta';

  // 2. CONTROL CLAVE: Si ya estamos mostrando este mismo mapa, NO HACEMOS NADA.
  // Esto evita que el bucle de 5 segundos destruya el mapa continuamente.
  if (this.mapaInicializado && this.idViajeDibujado === idActual && this.tipoServicioDibujado === tipoActual) {
    return; 
  }

  // Guardamos el registro de lo que vamos a dibujar ahora
  this.idViajeDibujado = idActual;
  this.tipoServicioDibujado = tipoActual;
  this.mapaInicializado = true;

  // Caso A: El backend ya provee las coordenadas directamente
  if (datosViaje.lonOrigen && datosViaje.latOrigen && datosViaje.lonDestino && datosViaje.latDestino) {
    setTimeout(() => {
      this.inicializarYFijarRuta(
        datosViaje.lonOrigen, datosViaje.latOrigen, 
        datosViaje.lonDestino, datosViaje.latDestino
      );
    }, 100);
    return;
  }

  // Caso B: El backend solo envió texto. ¡Buscamos las coordenadas en vivo!
  if (datosViaje.origen && datosViaje.destino) {
    const latJujuy = -24.185;
    const lonJujuy = -65.299;
    const textoOrigenSeguro = `${datosViaje.origen}, Jujuy, Argentina`;
    const textoDestinoSeguro = `${datosViaje.destino}, Jujuy, Argentina`;

    this.geocodingService.buscarSugerencias(textoOrigenSeguro, latJujuy, lonJujuy).subscribe(origenRes => {
      if (origenRes && origenRes.length > 0) {
        const puntoOrigen = origenRes[0];

        this.geocodingService.buscarSugerencias(datosViaje.destino, latJujuy, lonJujuy).subscribe(destinoRes => {
          if (destinoRes && destinoRes.length > 0) {
            const puntoDestino = destinoRes[0];

            setTimeout(() => {
              this.inicializarYFijarRuta(
                puntoOrigen.lon, puntoOrigen.lat,
                puntoDestino.lon, puntoDestino.lat
              );
            }, 100);
          }
        });
      }
    });
  }
  }

  private inicializarYFijarRuta(lonO: number, latO: number, lonD: number, latD: number) {
  this.mapaService.inicializarMapa('mapa-conductora', lonO, latO, 13);
  this.mapaService.fijarMarcadorOrigen(lonO, latO);
  this.mapaService.fijarMarcadorDestino(lonD, latD);
  this.mapaService.trazarRuta(lonO, latO, lonD, latD);
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

  cancelarViaje() {
    if (!this.viajeActivo) return;
    this.conductoraService.cancelarViaje(this.viajeActivo.idViaje).subscribe({
      next: (res) => {
        this.monto = res.viaje.monto;
        this.viajeActivo.estadoViaje = 'Cancelado en Ruta';
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

  refrescar(){
    this.viajeActivo = null; 
    this.propuesta = null;
    this.mapaInicializado = false;
    this.idViajeDibujado = null;
    this.tipoServicioDibujado = null;
    this.mapaService.destruirMapa();
    this.zone.run(() => {
          this.obtenerGananciasDelDia();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
  }
}