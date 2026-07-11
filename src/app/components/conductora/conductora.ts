import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { JornadaCard } from '../jornada-card/jornada-card';
import { VehiculoCard } from '../vehiculo-card/vehiculo-card';
import { CambioVehiculoModal } from '../cambio-vehiculo-modal/cambio-vehiculo-modal'; 
import { AuthService } from '../../services/auth.service';
import { ConductoraService } from '../../services/conductora.service';
import { MapaService } from '../../services/mapa.service';
import { GeocodingService } from '../../services/geocoding.service';
import Swal from 'sweetalert2';

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
  detalleViaje: any = null;
  isProcesandoPago: boolean = false;

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
    if (this.isProcesandoPago) {
      console.log("Sincronización pausada: Conductora procesando el pago en pantalla.");
      return; 
    }

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
                this.detalleViaje=this.obtenerDetalleViajeCompleto(this.viajeActivo.idViaje);
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
    const idActual = datosViaje.idViaje || datosViaje.idSolicitud || datosViaje.origen + datosViaje.destino;
    const tipoActual = datosViaje.estadoViaje ? 'activo' : 'propuesta';

    if (this.mapaInicializado && this.idViajeDibujado === idActual && this.tipoServicioDibujado === tipoActual) {
      return; 
    }

    this.idViajeDibujado = idActual;
    this.tipoServicioDibujado = tipoActual;
    this.mapaInicializado = true;

    if (datosViaje.lonOrigen && datosViaje.latOrigen && datosViaje.lonDestino && datosViaje.latDestino) {
      setTimeout(() => {
        this.inicializarYFijarRuta(
          datosViaje.lonOrigen, datosViaje.latOrigen, 
          datosViaje.lonDestino, datosViaje.latDestino
        );
      }, 100);
      return;
    }

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
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.conductoraService.finalizarViaje(this.viajeActivo.idViaje).subscribe({
      next: (res) => {
        this.monto = res.viaje.monto;
        const idViaje = res.viaje.idViaje;

        this.isProcesandoPago = true; 
        this.mostrarMenuPago(idViaje);
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'No se pudo finalizar el servicio', 'error');
        this.reanudarIntervalo();
      }
    });
  }

  private mostrarMenuPago(idViaje: number) {
    Swal.fire({
      title: `Servicio Finalizado: $${this.monto}`,
      text: 'Seleccione el método con el que abonará la pasajera:',
      icon: 'info',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Efectivo',
      denyButtonText: 'Mercado Pago',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#28a745',
      denyButtonColor: '#009ee3',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.conductoraService.confirmarPagoEfectivo(idViaje).subscribe({
          next: () => {
            Swal.fire('¡Éxito!', 'Pago en efectivo registrado.', 'success');
            this.isProcesandoPago = false; 
            this.limpiarPantallaViaje();
            this.reanudarIntervalo();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.error || 'No se pudo registrar el pago', 'error');
            this.reanudarIntervalo();
          }
        });
      }
      else if (result.isDenied) {
        this.pagarMercadoPago(idViaje);
      }
      else {
        this.isProcesandoPago = false; 
        this.reanudarIntervalo();
      }
    });
  }

  private pagarMercadoPago(idViaje: number) {
    Swal.fire({
      title: 'Generando link...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.conductoraService.confirmarPagoMercadoPago(idViaje, this.monto).subscribe({
      next: (mpRes) => {
        Swal.close();
        if (!mpRes.sandbox_init_point) {
          Swal.fire('Error', 'No se pudo generar el enlace de pago.', 'error');
          this.mostrarMenuPago(idViaje);
          return;
        }

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(mpRes.sandbox_init_point)}`;
        
        Swal.fire({
          title: 'Cobrar con Mercado Pago',
          html: `
            <img src="${qrUrl}" style="max-width:220px;margin-bottom:15px;">
            <p>Monto: <h3>$${this.monto}</h3></p>
            <p>Escanee el QR o presione <b>Abrir Pasarela</b>.</p>
            <small>Verificá el comprobante antes de confirmar.</small>
          `,
          confirmButtonText: 'Abrir Pasarela',
          showDenyButton: true,
          denyButtonText: 'Ya pagó (Confirmar)', 
          showCancelButton: true,
          cancelButtonText: 'Cambiar método',
          allowOutsideClick: false,
          preConfirm: () => {
            window.open(mpRes.sandbox_init_point, '_blank');
            return false; 
          }
        }).then((resultado) => {
          if (resultado.isDenied) {
            const paymentIdSimulado = `MP-SIM-${Date.now()}`;
            this.conductoraService.registrarPagoMercadoPago(idViaje, paymentIdSimulado).subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: 'Pago registrado',
                  text: 'Pago de Mercado Pago registrado correctamente.'
                });
                this.isProcesandoPago = false; 
                this.limpiarPantallaViaje();
                this.reanudarIntervalo();
              },
              error: (err) => {
                Swal.fire('Error', err.error?.error || 'No se pudo registrar el pago.', 'error');
              }
            });
          }
          else if (resultado.dismiss === Swal.DismissReason.cancel) {
            this.mostrarMenuPago(idViaje);
          }
          else {
            this.isProcesandoPago = false;
            this.reanudarIntervalo();
          }
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo generar el QR de Mercado Pago.', 'error');
        this.mostrarMenuPago(idViaje);
      }
    });
  }

  private reanudarIntervalo() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      this.zone.run(() => {
        this.consultarPanelEnVivo();
      });
    }, 10000);
  }

  private limpiarPantallaViaje() {
    this.viajeActivo = null;
    this.propuesta = null;
    this.detalleViaje = null;
    this.monto = 0;
    this.mapaInicializado = false;
    this.idViajeDibujado = null;
    this.tipoServicioDibujado = null;
    if (this.mapaService) this.mapaService.destruirMapa();
    
    this.zone.run(() => {
      this.obtenerGananciasDelDia();
      this.cdr.detectChanges();
    });
  }

  obtenerDetalleViajeCompleto(idViaje: number): void {
    this.conductoraService.obtenerDetalleViajeCompleto(idViaje).subscribe({
      next: (detalle) => {
        console.log("Detalle del viaje:", detalle);
        this.detalleViaje = detalle;
      },
      error: (err) => {
        console.error("Error al obtener detalle del viaje", err);
      }
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
    this.detalleViaje = null;
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