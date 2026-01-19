import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({
  // El guard se registra a nivel global como patrón singleton
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    // Servicio que gestiona el estado de autenticación del usuario
    private authService: AuthService,

    // Router usado para redireccionar si no está autenticado
    private router: Router
  ) { }

  // Método principal; se ejecuta antes de permitir el acceso a la ruta protegida

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    // Verifica si el usuario tiene una sesión activa
    if (this.authService.isLoggedIn()) {
      // Permite el acceso a la ruta solicitada
      return true;
    }

    // Si no está autenticado, redirige a pantalla de login
    return this.router.createUrlTree(['/login']);
  }
}
