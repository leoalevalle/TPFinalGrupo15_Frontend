import { Component, Input, OnInit, ChangeDetectorRef} from '@angular/core';
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
export class VehiculoCard implements OnInit {
  @Input() conductoraInfo: any;
  vehiculo: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.conductoraInfo && this.conductoraInfo.vehiculoAsignado) {
      this.vehiculo = this.conductoraInfo.vehiculoAsignado;
      this.cdr.detectChanges();
    }
  }
}