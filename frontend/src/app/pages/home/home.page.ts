import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css'
})
export class HomePage {
  isLoggedIn = false;

  constructor(private readonly auth: AuthService, private readonly router: Router) {
    this.auth.isLoggedIn().subscribe((v) => (this.isLoggedIn = v));
  }

  onGetStartedClick() {
    if (this.isLoggedIn) {
      this.router.navigateByUrl('/services');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  onExploreClick() {
    this.router.navigateByUrl('/services');
  }
}
