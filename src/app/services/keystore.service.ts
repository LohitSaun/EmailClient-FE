import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class KeyStoreService {
  private _privateKey = signal<CryptoKey | null>(null);

  setPrivateKey(key: CryptoKey) {
    this._privateKey.set(key);
  }

  getPrivateKey() {
    return this._privateKey();
  }

  clearPrivateKey() {
    this._privateKey.set(null);
  }

  hasKey(): boolean {
    return !!this._privateKey();
  }
}
