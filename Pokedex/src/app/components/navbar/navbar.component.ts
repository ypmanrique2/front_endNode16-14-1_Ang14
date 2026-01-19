import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  nickname: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar el estado inicial de la autenticación
    this.isAuthenticated = this.authService.isLoggedIn();

    if (this.isAuthenticated) {
      this.nickname = this.userService.getUserProfile().nickname;
    }

    // Suscribirse a los cambios de autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.nickname = this.userService.getUserProfile().nickname;
      }
    });

    // Suscribirse a los cambios en el perfil
    this.userService.userProfile$.subscribe(profile => {
      this.nickname = profile.nickname;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
