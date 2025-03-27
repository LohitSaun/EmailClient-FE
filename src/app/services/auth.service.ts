import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(sessionStorage.getItem('token'));

  token = computed(() => this._token());
  isAuthenticated = computed(() => !!this._token());

  constructor(private http: HttpClient) {}

  loginWithGitHub() {
    const clientId = 'Ov23lidiz3rzArwCr5F1';
    const redirectUri = 'http://localhost:4200/auth/callback';
    let scope = 'read:user user:email';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  }

  exchangeCodeForToken(code: string) {
    return this.http.post<{ token: string }>(
      'https://emailclient.onrender.com/auth/github-exchange',
      { code }
    );
  }

  setToken(token: string) {
    this._token.set(token);
    sessionStorage.setItem('token', token);
  }

  logout() {
    this._token.set(null);
    sessionStorage.removeItem('token');
  }
}
