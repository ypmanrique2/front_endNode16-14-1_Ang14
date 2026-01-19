import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Credenciales ingresadas por el usuario
  username: string = '';
  password: string = '';

  // Mensaje de error para feedback en UI
  errorMessage: string = '';

  // Controla la visibilidad de la contraseña
  showPassword: boolean = false;

  constructor(
    // Manejo de la autenticación
    private authService: AuthService,

    // Navegación entre las vistas UI
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirige si ya existe sesión activa
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/pokemons']);
    }
  }

  onSubmit(): void {
    // Limpia errores los previos
    this.errorMessage = '';

    // Validación básica del formulario
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor ingresa usuario y contraseña';
      return;
    }

    // Intenta autenticar al usuario con sus credenciales de autenticación
    const success = this.authService.login(this.username, this.password);

    // Redirección o mensaje de error según el resultado
    if (success) {
      this.router.navigate(['/pokemons']);
    } else {
      this.errorMessage = 'Credenciales incorrectas.';
      this.password = '';
    }
  }

  // Alterna el mostrar u ocultar contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
