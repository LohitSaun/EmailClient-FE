import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { KeyStoreService } from '../../services/keystore.service';

@Component({
  standalone: true,
  selector: 'app-key-setup',
  imports: [CommonModule, FormsModule],
  templateUrl: './keysetup.component.html',
})
export class KeySetupComponent implements OnInit {
  gistUrl = '';
  isKeySet = false;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private keyStore: KeyStoreService
  ) {}

  ngOnInit(): void {
    this.fetchUserPublicKey();
  }

  async fetchUserPublicKey() {
    const token = this.auth.token();
    const res: any = await this.http
      .get('https://emailclient.onrender.com/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .toPromise();

    if (res.publicKeyGist) {
      this.gistUrl = res.publicKeyGist;
      this.isKeySet = true;
    }
  }

  handleUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const pem = reader.result as string;
      const keyBuf = this.pemToArrayBuffer(pem);
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        keyBuf,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
      );
      this.keyStore.setPrivateKey(privateKey);
    };
    reader.readAsText(file);
  }

  save() {
    const token = this.auth.token();
    this.http
      .put(
        'https://emailclient.onrender.com/user/public-key',
        {
          publicKeyGist: this.gistUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .subscribe(() => {
        alert('Public key Gist saved!');
        this.isKeySet = true;
      });
  }

  private pemToArrayBuffer(pem: string): ArrayBuffer {
    const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
}
