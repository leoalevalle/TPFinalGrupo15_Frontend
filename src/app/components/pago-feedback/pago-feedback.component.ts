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
        <small *ngIf="paymentId" class="text-secondary d-block mb-4">ID Transacción: {{ paymentId }}</small>
        
        <button class="btn btn-primary w-100" style="background-color: #ff4f8b; border: none;" (click)="volver()"> <!--[cite: 4] -->
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

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private http: HttpClient 
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
    console.log("PARAMETROS MP");

    console.log(params);


      this.status = params['status']; 
      this.paymentId = params['payment_id']; 
      
      const idViaje = params['external_reference']; 

      if (this.status === 'approved') {
        this.titulo = '¡Pago Aprobado!'; 
        this.mensaje = 'Procesando la acreditación en nuestro sistema...';
        
        const body = { idViaje: Number(idViaje), paymentId: this.paymentId };
        
        const token = localStorage.getItem('token'); 
        const headers = { 'Authorization': `Bearer ${token}` };

        this.http.put('http://localhost:3000/api/transaccion/viajes/confirmar-mercadopago', body, { headers }) 
          .subscribe({
            next: (res: any) => {
              this.mensaje = 'El pago se acreditó correctamente. La conductora ya recibió el saldo en su billetera y fue liberada.'; 
            },
            error: (err) => {
              console.error('Error al acreditar el viaje:', err);
              this.mensaje = 'El pago se cobró en Mercado Pago pero tuvimos un problema al actualizar el estado de tu viaje en el sistema.';
            }
          });

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