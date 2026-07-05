import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { Footer } from './components/footer/footer';
import { Hero } from './components/hero/hero';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Hero],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tpangular');
}
