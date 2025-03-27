import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ComposeComponent } from '../compose/compose.component';
import { InboxComponent } from '../inbox/inbox.component';
import { KeySetupComponent } from '../keysetup/keysetup.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    ComposeComponent,
    InboxComponent,
    KeySetupComponent,
    HeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  gistUrl = '';
  privateKeyContent = '';
  activeTab: 'inbox' | 'compose' | 'settings' = 'inbox';

  constructor(private http: HttpClient, private auth: AuthService) {}

  handleKeyUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.privateKeyContent = e.target?.result as string;
        sessionStorage.setItem('privateKey', this.privateKeyContent); // Store in-memory
      };
      reader.readAsText(file);
    }
  }

  savePublicKey() {
    const token = this.auth.token();
    this.http
      .put(
        'https://emailclient.onrender.com/user/public-key',
        { publicKeyGist: this.gistUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .subscribe({
        next: () => alert('Public key saved'),
        error: (err) => alert('Error saving public key'),
      });
  }

  tabClass(tab: string) {
    return {
      'px-4 py-2 rounded': true,
      'bg-blue-600 text-white': this.activeTab === tab,
      'bg-gray-200 text-black': this.activeTab !== tab,
    };
  }
}
