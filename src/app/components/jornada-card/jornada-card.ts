import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConductoraService } from '../../services/conductora';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-jornada-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jornada-card.html',
  styleUrl: './jornada-card.css',
})
export class JornadaCard {
  enJornada: boolean = false;
  zonaActual: string = '';

  constructor( 
    private conductoraService: ConductoraService,
    private authService: AuthService
  ){}

  iniciarJornada(){

    const usuario = this.authService.getUser();
    console.log("Iniciar jornada");
    const datos={
        idConductora:usuario?.id,
        zonaActual:"Centro"
    };
    console.log(datos);

    this.conductoraService.iniciarJornada(datos).subscribe({
      next: (response) => {
        console.log("Jornada iniciada", response);
        this.enJornada = true;
        this.zonaActual = "Centro";
      },
      error: (error) => {
        console.error("Error al iniciar jornada", error);
      }
    });
  }

  finalizarJornada(){
    const usuario = this.authService.getUser();
    console.log("Finalizar jornada");
    const datos={
        idConductora:usuario?.idUsuario
    };
    console.log(datos);

    this.conductoraService.finalizarJornada(datos).subscribe({
      next: (response) => {
        console.log("Jornada finalizada", response);
        this.enJornada = false;
        this.zonaActual = '';
      },
      error: (error) => {
        console.error("Error al finalizar jornada", error);
      }
    });
  }
}
