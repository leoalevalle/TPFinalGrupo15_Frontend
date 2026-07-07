import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }
  abrirRegistroConductora() {
    const evento = new CustomEvent('abrirRegistroConductora');

    window.dispatchEvent(evento);
  }
}
