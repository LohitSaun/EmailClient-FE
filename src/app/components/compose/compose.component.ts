import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-compose',
  imports: [CommonModule, FormsModule],
  templateUrl: './compose.component.html',
})
export class ComposeComponent implements OnInit {
  recipient = '';
  message = '';
  userList: { username: string; publicKeyGist: string }[] = [];
  selectedUsername = '';

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    const token = this.auth.token();
    this.http
      .get<{ username: string; publicKeyGist: string }[]>(
        'https://emailclient.onrender.com/user/all',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .subscribe((users) => {
        this.userList = users;
      });
  }

  async send() {
    const user = this.userList.find(
      (u) => u.username === this.selectedUsername
    );
    if (!user?.publicKeyGist) {
      return alert('Recipient does not have a public key set.');
    }

    const publicKey = await this.fetchPublicKey(user.username);
    if (!publicKey) return alert('Failed to load public key');

    const encryptedBody = await this.encryptMessage(this.message, publicKey);

    const token = this.auth.token();
    this.http
      .post(
        'https://emailclient.onrender.com/emails',
        {
          recipient: user.username,
          encryptedBody,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .subscribe(() => {
        alert('Email sent!');
        this.message = '';
      });
  }

  async fetchPublicKey(username: string): Promise<CryptoKey | null> {
    // 1. Get Gist URL from our own backend
    const res = await this.http
      .get<{ publicKeyGist: string }>(
        `https://emailclient.onrender.com/user/public-key/${username}`
      )
      .toPromise();

    const gistUrl = res?.publicKeyGist;
    const gistId = gistUrl?.split('/').pop(); // Extract ID from URL

    // 2. Fetch Gist metadata from GitHub
    const gistMeta: any = await fetch(
      `https://api.github.com/gists/${gistId}`
    ).then((r) => r.json());

    // 3. Get the public-key file’s raw_url
    const publicKeyFile: any = Object.values(gistMeta.files).find((f: any) =>
      f.filename.includes('public-key')
    );
    if (!publicKeyFile?.raw_url) return null;

    // 4. Fetch actual key content
    const pem = await fetch(publicKeyFile.raw_url).then((r) => r.text());

    // 5. Convert PEM to CryptoKey
    return window.crypto.subtle.importKey(
      'spki',
      this.pemToArrayBuffer(pem),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );
  }

  pemToArrayBuffer(pem: string): ArrayBuffer {
    const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  async encryptMessage(
    plainText: string,
    publicKey: CryptoKey
  ): Promise<string> {
    const encoded = new TextEncoder().encode(plainText);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
}
