import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Hero } from './components/hero/hero';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Header, Footer, Hero],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('tpangular');
  mostrarHero = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mostrarHero = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/hello';
      }
    });
  }
}
