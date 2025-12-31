import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent {
  navLinks = [
    { label: 'Particuliers', href: '#' },
    { label: 'Entreprises', href: '#' },
    { label: 'Banque Privée', href: '#' },
    { label: 'A propos', href: '#' }
  ];
}
