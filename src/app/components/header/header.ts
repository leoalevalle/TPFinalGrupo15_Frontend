import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginModal } from '../login-modal/login-modal';
import { GoogleLogin } from '../google-login/google-login';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, RouterModule, LoginModal, GoogleLogin],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  
  
}

