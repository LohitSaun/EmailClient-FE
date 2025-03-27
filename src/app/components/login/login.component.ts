import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(private auth: AuthService) {}
  login() {
    this.auth.loginWithGitHub();
  }
}
