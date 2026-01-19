import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  // Servicio singleton disponible en toda la aplicación
  providedIn: 'root'
})
export class AuthService {
  // Estado interno de autenticación (true / false)
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  // Observable público para que otros componentes reaccionen al login/logout
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  // Credenciales mockeadas para recordar usuario y contraseña
  private readonly VALID_USERNAME = 'iptdevs';
  private readonly VALID_PASSWORD = '123456';
  // Clave usada para simular una sesión persistente
  private readonly TOKEN_KEY = 'auth_token';

  constructor() {
    // Se emite el estado inicial de inmediato si existe token en localStorage
    this.isAuthenticatedSubject.next(this.hasToken());
  }

  // Valida credenciales y simula autenticación
  login(username: string, password: string): boolean {
    // Validación básica contra credenciales predefinidas
    if (username === this.VALID_USERNAME && password === this.VALID_PASSWORD) {
      // Genera token simulado
      const token = this.generateToken();
      // Persiste sesión en localStorage
      localStorage.setItem(this.TOKEN_KEY, token);
      // Notifica a la aplicación que el usuario está autenticado
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    // Login fallido
    return false;
  }

  // Cierra sesión del usuario
  logout(): void {
    // Elimina el token almacenado
    localStorage.removeItem(this.TOKEN_KEY);
    // Emite estado no autenticado
    this.isAuthenticatedSubject.next(false);
  }

  //Verifica si el usuario está autenticado
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  // Comprueba existencia de token en almacenamiento local
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Genera un token simple (simulación JWT)
  private generateToken(): string {
    return btoa(`${this.VALID_USERNAME}:${Date.now()}`);
  }
}
