import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPage {
  username = '';
  password = '';
  error: string | null = null;
  loading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  onLoginClick() {
    this.error = null;
    this.loading = true;

    const result = this.auth.login({ username: this.username, password: this.password });
    this.loading = false;

    if (!result.ok) {
      this.error = result.error;
      return;
    }

    this.router.navigateByUrl('/services');
  }
}
