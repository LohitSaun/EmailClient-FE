import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { KeyStoreService } from '../../services/keystore.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  template: `
    <header
      class="flex justify-between items-center px-6 py-4 bg-gray-800 text-white"
    >
      <h1 class="text-xl font-semibold">SecureMail</h1>
      <button
        class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
        (click)="logout()"
      >
        Logout
      </button>
    </header>
  `,
})
export class HeaderComponent {
  constructor(
    private auth: AuthService,
    private keyStore: KeyStoreService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.keyStore.clearPrivateKey();
    this.router.navigate(['/login']);
  }
}
