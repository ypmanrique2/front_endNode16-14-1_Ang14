import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

// Modelo de perfil de usuario usado en el perfil
export interface UserProfile {
  nickname: string;
  email: string;
  favoriteTypes: string[];
  avatar: string;
  favoriteMovieGenres: string[];
}

@Injectable({
  // Servicio singleton para gestión de perfil del usuario
  providedIn: 'root'
})
export class UserService {

  // Clave para persistencia local
  private readonly USER_KEY = 'user_profile';

  // Perfil por defecto (mock para recordar usuario y contraseña por ahora)
  private defaultProfile: UserProfile = {
    nickname: 'iptdevs',
    email: 'iptdevs@pokemon.com',
    favoriteTypes: [],
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    favoriteMovieGenres: []
  };

  // Estado reactivo del perfil de usuario
  private userProfileSubject =
    new BehaviorSubject<UserProfile>(this.loadProfile());

  // Observable expuesto a componentes
  public userProfile$: Observable<UserProfile> =
    this.userProfileSubject.asObservable();

  constructor() { }

  // Clave de almacenamiento en sesión
  private STORAGE_KEY = 'user_profile';

  // Obtiene el perfil desde sessionStorage
  getUserProfile(): UserProfile {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : {
        nickname: 'iptdevs',
        email: '',
        avatar: '',
        favoriteMovieGenres: [],
        favoriteTypes: []
      };
  }

  // Actualiza el perfil del usuario en sesión
  updateUserProfile(profile: UserProfile): void {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
  }

  // Carga perfil inicial desde localStorage o fallback
  private loadProfile(): UserProfile {
    const saved = localStorage.getItem(this.USER_KEY);
    return saved ? JSON.parse(saved) : this.defaultProfile;
  }
}
