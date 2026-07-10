import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoogleRegister } from '../../services/google-register';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
})
export class LoginModal implements OnInit {
  activeTab = 'login';
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  conductoraForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private googleRegister: GoogleRegister
  ) {
    this.loginForm = this.fb.group({
      nomUsuario: ['', Validators.required],
      contrasenia: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nomUsuario: ['', Validators.required],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]],
      sexo: ['', Validators.required],
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
      patente: ['', Validators.required],
    });
  }

  iniciarSesion() {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.authService.guardarSesion(res);

        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          this.cerrarModal();

          this.redirigirPorRol(res.user.rol);

          this.cd.detectChanges();
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Credenciales incorrectas',
        });
      },
    });
  }
  private cerrarModal() {
    const modalEl = document.getElementById('loginModal');
    if (modalEl) {
      // @ts-ignore - bootstrap viene del script global, no como import
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  registrarse() {
    if (this.registerForm.invalid) return;

    // 🛑 VALIDACIÓN DE FILTRO DE GÉNERO
    const sexoSeleccionado = this.registerForm.get('sexo')?.value;
    if (sexoSeleccionado !== 'F') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Restringido',
        text: 'La aplicación TaxiFem es de uso exclusivo para mujeres. Por favor, te invitamos a utilizar otro medio de transporte urbano.',
        confirmButtonColor: '#9c27b0', // Un color violeta/rosa a tono con la app
        confirmButtonText: 'Entendido'
      });
      return; // Frena el envío al backend
    }

    const nuevaPasajera = {
      ...this.registerForm.value,
      rol: 1,
      activo: true,
    };

    this.authService.register(nuevaPasajera as any).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: '¡Bienvenida a la comunidad de TaxiFem!',
        });
        this.activeTab = 'login';
        this.registerForm.reset();
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrarse',
          text: err.error?.msg || 'Ocurrió un problema técnico.',
        });
      },
    });
  }

  registrarConductora() {
    if (this.conductoraForm.invalid) return;

    // 🛑 VALIDACIÓN DE FILTRO DE GÉNERO
    const sexoSeleccionado = this.conductoraForm.get('sexo')?.value;
    if (sexoSeleccionado !== 'F') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Restringido',
        text: 'La plataforma TaxiFem admite únicamente a conductoras mujeres para garantizar la seguridad del servicio. Te invitamos a postularte en otras plataformas de transporte.',
        confirmButtonColor: '#9c27b0',
        confirmButtonText: 'Entendido'
      });
      return; // Frena el envío al backend
    }

    this.authService.registerConductora(this.conductoraForm.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Solicitud enviada',
          text: 'Tu solicitud técnica y la del vehículo serán revisadas por una administradora.',
        });
        this.activeTab = 'login';
        this.conductoraForm.reset();
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar solicitud',
          text: err.error?.msg || 'Verifique los datos ingresados.',
        });
      },
    });
  }

  redirigirPorRol(rol: number) {
    console.log('6. Entrando a redirigirPorRol con rol:', rol);

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
        this.router.navigate(['/administradora']);
        break;
      default:
        console.log('ROL NO RECONOCIDO:', rol);
    }
  }

  ngOnInit(): void{

    this.googleRegister.registrar$.subscribe(datos=>{

    this.activeTab = datos.tipo;
    this.cd.detectChanges(); 
    
    const modal = document.getElementById('loginModal');
    if(modal){
      // @ts-ignore
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
       this.activeTab = datos.tipo;
        if(datos.tipo === 'register'){
            this.registerForm.patchValue({
                nombre: datos.nombre,
                email: datos.email
            });

        }else{
            this.conductoraForm.patchValue({
                nombre: datos.nombre,
                email: datos.email
            });
        }
    });
  }


}
