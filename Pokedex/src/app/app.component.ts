import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Usamos el sufijo $ para indicar que es un Observable
  isAuthenticatedSubject$!: Observable<boolean>;
  currentUser: string = 'iptdevs'; // Hardcodeado a iptdevs por ahora

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Se conecta al stream de datos de autenticación
    this.isAuthenticatedSubject$ = this.authService.isAuthenticated$; // (Ojo: usa el getter que se define o el método iSAuthenticatedSubject())
  }

  logout() {
    this.authService.logout();
  }
}
