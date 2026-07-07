import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoginModal } from '../login-modal/login-modal';
import { GoogleLogin } from '../google-login/google-login';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginModal, GoogleLogin],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.authService = authService;
    this.router = router;
  }
  getIsLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUserRole(): number | null {
    const user = this.authService.getUser();
    return user ? user.rol : null;
  }
  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
