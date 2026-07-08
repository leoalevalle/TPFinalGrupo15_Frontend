import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConductoraService } from '../../services/conductora';
import { AuthService } from '../../services/auth.service';
import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-jornada-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jornada-card.html',
  styleUrl: './jornada-card.css',
})
export class JornadaCard implements OnInit {
  @Input() conductoraInfo: any;
  enJornada: boolean = false;
  zonaActual: string = '';

  constructor(
    private conductoraService: ConductoraService,
    private geocodingService: GeocodingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.conductoraInfo) {
      this.enJornada = this.conductoraInfo.enJornada || false;
      this.zonaActual = this.conductoraInfo.zonaActual || '';
    }
  }

  iniciarJornada() {
  console.log("Obteniendo ubicación del navegador...");
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización.");
    return;
    }
    navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      this.geocodingService.obtenerUbicacion(lat, lng).subscribe({
        next: (ubicacion) => {
          console.log("Ubicación obtenida:", ubicacion);
          const datos = {
            idConductora: this.conductoraInfo.idUsuario,
            zonaActual: ubicacion.zona
          };
          this.enviarAlBackend(datos);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error obteniendo ubicación", err);
          this.enviarAlBackend({
            idConductora: this.conductoraInfo.idUsuario,
            zonaActual: "Centro"
          });
        }
      });
    },

    (error) => {
      console.error("Permiso de ubicación denegado", error);
      this.enviarAlBackend({
        idConductora: this.conductoraInfo.idUsuario,
        zonaActual: "Centro"
      });
    }
  );
  }

  private enviarAlBackend(datos: any) {
    this.conductoraService.iniciarJornada(datos).subscribe({
      next: (response) => {
        this.enJornada = true;
        this.zonaActual = datos.zonaActual;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al impactar el backend propio", err)
    });
  }

  finalizarJornada() {
    const datos = { idConductora: this.conductoraInfo.idUsuario };
    this.conductoraService.finalizarJornada(datos).subscribe({
      next: () => {
        this.enJornada = false;
        this.zonaActual = '';
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
}