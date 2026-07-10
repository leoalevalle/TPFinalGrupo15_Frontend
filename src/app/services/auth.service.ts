import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  // Login con Google
  loginGoogle(data:any){
    return this.http.post(`${this.apiUrl}/auth/login-google`, data);
  }

  // Registro de Pasajera
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  // Registro de Conductora (Cambiamos la URL para que entre por /auth)
  registerConductora(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register-conductora`, data);
  }

  guardarSesion(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  registerGoogle(data:any){
    return this.http.post(
        `${this.apiUrl}/auth/register-google-pasajera`,
        data
    );
  }
}

