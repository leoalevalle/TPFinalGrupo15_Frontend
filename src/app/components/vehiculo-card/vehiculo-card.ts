import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ConductoraService } from '../../services/conductora';


@Component({
  selector: 'app-vehiculo-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehiculo-card.html',
  styleUrl: './vehiculo-card.css',
})
export class VehiculoCard {
  vehiculo: any;

  constructor(
    private authService: AuthService,
    private conductoraService: ConductoraService
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUser();
    this.conductoraService
      .obtenerVehiculo(usuario.idUsuario)
      .subscribe((res: any) => {
        this.vehiculo = res;
      });
  }
}
