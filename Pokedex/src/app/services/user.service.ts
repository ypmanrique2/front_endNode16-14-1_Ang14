import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  nickname: string;
  email: string;
  favoriteTypes: string[];
  avatar: string;
  favoriteMovieGenres: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_KEY = 'user_profile';
  private defaultProfile: UserProfile = {
    nickname: 'iptdevs',
    email: 'iptdevs@pokemon.com',
    favoriteTypes: [],
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    favoriteMovieGenres: [],
  };

  private userProfileSubject = new BehaviorSubject<UserProfile>(this.loadProfile());
  public userProfile$: Observable<UserProfile> = this.userProfileSubject.asObservable();

  constructor() { }

  private STORAGE_KEY = 'user_profile';

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

  updateUserProfile(profile: UserProfile): void {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
  }

  private loadProfile(): UserProfile {
    const saved = localStorage.getItem(this.USER_KEY);
    return saved ? JSON.parse(saved) : this.defaultProfile;
  }
}
