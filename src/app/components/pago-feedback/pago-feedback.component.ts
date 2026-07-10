import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pago-feedback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5 text-center">
      <div class="card shadow p-5 mx-auto" style="max-width: 500px; border-radius: 20px;">
        <div *ngIf="status === 'approved'" class="text-success fs-1 mb-3">✅</div>
        <div *ngIf="status !== 'approved'" class="text-danger fs-1 mb-3">❌</div>
        
        <h2>{{ titulo }}</h2>
        <p class="text-muted mt-2">{{ mensaje }}</p>
        <hr>
        <small class="text-secondary d-block mb-4">ID Transacción: {{ paymentId }}</small>
        
        <button class="btn btn-primary w-100" style="background-color: #ff4f8b; border: none;" (click)="volver()">
          Volver al Inicio
        </button>
      </div>
    </div>
  `
})
export class PagoFeedback implements OnInit {
  status: string = '';
  paymentId: string = '';
  titulo: string = 'Procesando...';
  mensaje: string = 'Estamos validando tu pago con la central.';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.status = params['status']; // 'approved', 'rejected', 'pending'
      this.paymentId = params['payment_id'];

      if (this.status === 'approved') {
        this.titulo = '¡Pago Aprobado!';
        this.mensaje = 'El pago se acreditó correctamente. La conductora ya fue liberada y tu viaje quedó registrado.';
      } else {
        this.titulo = 'Pago No Completado';
        this.mensaje = 'Hubo un inconveniente o el pago fue rechazado. Por favor, reintente con otro medio.';
      }
    });
  }

  volver() {
    this.router.navigate(['/']);
  }
}
