import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

 
declare const google: any; // Declara 'google' para evitar errores de TypeScript 

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-login.html',
  styleUrl: './google-login.css',
})
export class GoogleLogin implements OnInit {

   constructor(private ngZone: NgZone) {} 
 
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
    document.head.appendChild(script); 
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
      alert(`¡Bienvenido, ${decodedToken.name || decodedToken.email}!`); 
 
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
  
}
