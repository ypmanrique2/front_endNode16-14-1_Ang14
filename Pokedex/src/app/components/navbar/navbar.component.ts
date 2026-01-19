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

  // Indica si el usuario está autenticado; sirve para mostrar opciones navbar
  isAuthenticated: boolean = false;

  // Nickname del usuario; se muestra en la barra superior de navegación
  nickname: string = '';

  constructor(
    // Servicio encargado del estado de la autenticación
    private authService: AuthService,

    // Servicio que expone el perfil del usuario
    private userService: UserService,

    // Enrutamiento para la navegación
    private router: Router
  ) {}

  ngOnInit(): void {

    // Verifica estado inicial de autenticación al cargar el componente
    this.isAuthenticated = this.authService.isLoggedIn();

    // Si el usuario está autenticado, se obtiene su nickname desde perfil
    if (this.isAuthenticated) {
      this.nickname = this.userService.getUserProfile().nickname;
    }

    // Suscripción reactiva al estado de autenticación; el navbar se actualizará a logout
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;

      // Si el usuario acaba de autenticarse, se actualiza el nickname
      if (isAuth) {
        this.nickname = this.userService.getUserProfile().nickname;
      }
    });

    // Suscripción a cambios del perfil; util si el usuario lo edita (nickname, avatar)
    this.userService.userProfile$.subscribe(profile => {
      this.nickname = profile.nickname;
    });
  }

  // Cierra sesión; limpia estado de autenticación y redirige a login
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
