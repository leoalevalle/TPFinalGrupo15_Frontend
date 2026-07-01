import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelloService, HelloResponse } from '../../services/hello.service';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hello.html',
  styleUrl: './hello.css',
})
export class Hello implements OnInit {
  
  apiData: HelloResponse | null = null;
  errorMessage: string | null = null;
  loading: boolean = true;

  constructor(
    private helloService: HelloService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.obtenerSaludo();
  }

  obtenerSaludo(): void {
    this.loading = true;
    this.errorMessage = null;

    this.helloService.getHelloMessage().subscribe({
      next: (response) => {
        this.apiData = response;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'No se pudo conectar con el servidor backend';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }
}