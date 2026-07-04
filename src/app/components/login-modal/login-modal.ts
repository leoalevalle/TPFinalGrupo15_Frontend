import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule , Validators, FormGroup} from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';



@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
})
export class LoginModal {
  activeTab = 'login';
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  conductoraForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      contrasenia: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nomUsuario: ['', Validators.required],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]],
      sexo: ['', Validators.required]
    });

    this.conductoraForm = this.fb.group({
        // Datos personales
        nombre: ['', Validators.required],
        telefono: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        nomUsuario: ['', Validators.required],
        contrasenia: ['', [Validators.required, Validators.minLength(6)]],
        sexo: ['', Validators.required],

        // Datos del vehículo
        marca: ['', Validators.required],
        modelo: ['', Validators.required],
        color: ['', Validators.required],
        patente: ['', Validators.required]

    });
  }

 
  
  iniciarSesion() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.authService.guardarSesion(res);

        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          timer: 1500,
          showConfirmButton: false
        });

        this.redirigirPorRol(res.usuario.rol);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Credenciales incorrectas'
        });
      }
    });
  }

  registrarse() {
    if (this.registerForm.invalid) return;

    const nuevaPasajera = {
      ...this.registerForm.value,
      rol: 1,
      activo: true
    };

    this.authService.register(nuevaPasajera as any).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso'
        });

        this.activeTab = 'login';
        this.registerForm.reset();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrarse'
        });
      }
    });
  }

  registrarConductora() {

    if (this.conductoraForm.invalid) return;
    this.authService
        .registerConductora(this.conductoraForm.value)
        .subscribe({
          next: () => {
            Swal.fire({
              icon:'success',
              title:'Solicitud enviada',
              text:'Tu solicitud será revisada por una administradora.'
            });
            this.activeTab='login';
            this.conductoraForm.reset();
          },

          error:()=>{
            Swal.fire({
              icon:'info',
              title:'Backend pendiente',
              text:'La interfaz ya está lista. Falta implementar el endpoint de registro de conductoras.'
            });

          }

     });

  }


  redirigirPorRol(rol: number) {
    switch (rol) {
      case 1:
        this.router.navigate(['/pasajera']);
        break;

      case 2:
        this.router.navigate(['/conductora']);
        break;

      case 3:
        this.router.navigate(['/operadora']);
        break;

      case 4:
        this.router.navigate(['/admin']);
        break;
    }
  }
}
