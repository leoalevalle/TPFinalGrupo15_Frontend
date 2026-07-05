import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JornadaCard } from '../jornada-card/jornada-card';
import { VehiculoCard } from '../vehiculo-card/vehiculo-card';
import { CambioVehiculoModal } from '../cambio-vehiculo-modal/cambio-vehiculo-modal';
import { AuthService } from '../../services/auth.service';
import { ConductoraService } from '../../services/conductora';

@Component({
  selector: 'app-conductora',
  standalone: true,
  imports: [CommonModule, JornadaCard, VehiculoCard, CambioVehiculoModal],
  templateUrl: './conductora.html',
  styleUrl: './conductora.css',
})
export class Conductora {

  conductora:any;

  constructor(private authService: AuthService, private conductoraService: ConductoraService) {}

  ngOnInit(){

    const usuario=this.authService.getUser();

    this.conductoraService
        .obtenerConductora(usuario.idUsuario)
        .subscribe(res=>{

              this.conductora=res;

        });

  }

}
