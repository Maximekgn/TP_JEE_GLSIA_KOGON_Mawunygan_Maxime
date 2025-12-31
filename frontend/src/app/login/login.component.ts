import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  constructor(private router: Router) {}

  login() {
    // Mock authentication
    this.router.navigate(['/dashboard']);
  }
}
