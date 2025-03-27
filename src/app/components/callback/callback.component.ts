import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-callback',
  imports: [CommonModule],
  template: `<p>Logging in...</p>`,
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.auth.exchangeCodeForToken(code).subscribe({
        next: (res) => {
          this.auth.setToken(res.token);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['/login']);
        },
      });
    }
  }
}
