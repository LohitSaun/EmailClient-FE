import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { KeyStoreService } from '../../services/keystore.service';

@Component({
  standalone: true,
  selector: 'app-inbox',
  imports: [CommonModule],
  templateUrl: './inbox.component.html',
})
export class InboxComponent {
  messages = signal<
    {
      sender: string;
      timestamp: string;
      decrypted: () => string | null;
      encryptedBody: string;
    }[]
  >([]);

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private keyStore: KeyStoreService
  ) {
    this.loadInbox();
  }

  async loadInbox() {
    const token = this.auth.token();
    const res: any[] | undefined = await this.http
      .get<any[]>('https://emailclient.onrender.com/emails', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .toPromise();

    const msgs = res?.map((msg) => {
      const decrypted = signal<string | null>(null);
      this.decryptMessage(msg.encryptedBody).then((plain) =>
        decrypted.set(plain)
      );
      return {
        sender: msg.sender,
        timestamp: msg.timestamp,
        encryptedBody: msg.encryptedBody,
        decrypted,
      };
    });

    this.messages.set(msgs!);
  }

  async decryptMessage(encryptedBase64: string): Promise<string> {
    console.log('encrypted....', encryptedBase64);
    const privateKey = this.keyStore.getPrivateKey();
    if (!privateKey) return '[No private key loaded]';

    const encrypted = Uint8Array.from(atob(encryptedBase64), (c) =>
      c.charCodeAt(0)
    );
    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encrypted
      );
      return new TextDecoder().decode(decryptedBuffer);
    } catch (err) {
      console.error('Decryption failed:', err);
      return '[Decryption error]';
    }
  }
}
