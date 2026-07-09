import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
 
declare const google: any; // Declara 'google' para evitar errores de TypeScript 

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-login.html',
  styleUrl: './google-login.css',
})
export class GoogleLogin implements OnInit {

   constructor(
    private ngZone: NgZone,
    private authService: AuthService,
    private router: Router
   ) {} 
 
  ngOnInit(): void { 
    // Carga el script de Google GSI (Google Sign-In)
  this.loadGoogleScript(); 
    // 'bind(this)' asegura que 'this' dentro de handleCredentialResponse se refiera al 
// componente. 
    (window as any).handleCredentialResponse = this.handleCredentialResponse.bind(this); 
  } 
 
  private loadGoogleScript(): void { 
    const script = document.createElement('script'); 
    script.src = 'https://accounts.google.com/gsi/client'; 
    script.async = true; 
    script.defer = true; 
    script.onload = () => {
      this.initializeGoogle();
      console.log('Script de Google cargado correctamente');
    };
    document.head.appendChild(script); 
  } 

  private initializeGoogle(): void {
    google.accounts.id.initialize({
        client_id: "622901434111-ebp8jgcctf1jc4dfeqeqffrtg448r8u3.apps.googleusercontent.com",
        callback: this.handleCredentialResponse.bind(this)
    });

    google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        {
            theme: "outline",
            size: "large",
            width: "250"
        }
    );
}


 
  /** 
   * Maneja la respuesta de credenciales de Google después de un inicio de sesión exitoso. 
   * Contiene el token JWT con la información del usuario. 
   * @param response El objeto de respuesta de credenciales de Google. 
   */ 
  handleCredentialResponse(response: any): void { 
    // 'ngZone.run' asegura que los cambios y actualizaciones de Angular se detecten. 
    this.ngZone.run(() => { 
      console.log('Token JWT ID codificado:', response.credential); 
 
      // Decodifica el token JWT para obtener la información del usuario. 
      const decodedToken = this.decodeJwtResponse(response.credential); 
      console.log('Información de usuario decodificada (JSON):', decodedToken); 
 
      // Ejemplo de cómo acceder a la información: 
      // alert(`¡Bienvenido, ${decodedToken.name || decodedToken.email}!`); 
 
      // Aquí puedes llamar a tu servicio de autenticación
      this.authService.loginGoogle({
        email: decodedToken.email
      }).subscribe({
        next:(res:any)=>{
        this.authService.guardarSesion(res);
        this.cerrarModal();
        switch(res.user.rol){
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
        }
      },
      error:()=>{
        alert("No existe una cuenta registrada con ese correo.");
      }
    });

    }); 
  } 
 
  /** 
   * Decodifica un token JWT para extraer su payload (el JSON con la información). 
   */ 
  private decodeJwtResponse(token: string): any { 
    const base64Url = token.split('.')[1]; 
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); 
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) { 
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); 
    }).join('')); 
 
    return JSON.parse(jsonPayload); 
  }

  private cerrarModal() {
  const modalEl = document.getElementById('googleModal');
  if (modalEl) {
    // @ts-ignore - bootstrap viene del script global
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();
  }
  }
  
}
