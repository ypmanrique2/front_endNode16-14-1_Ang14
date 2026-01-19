import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  nickname: string;
  email: string;
  favoriteTypes: string[];
  avatar: string;
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
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
  };

  private userProfileSubject = new BehaviorSubject<UserProfile>(this.loadProfile());
  public userProfile$: Observable<UserProfile> = this.userProfileSubject.asObservable();

  constructor() {}

  getUserProfile(): UserProfile {
    return this.userProfileSubject.value;
  }

  updateUserProfile(profile: UserProfile): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(profile));
    this.userProfileSubject.next(profile);
  }

  private loadProfile(): UserProfile {
    const saved = localStorage.getItem(this.USER_KEY);
    return saved ? JSON.parse(saved) : this.defaultProfile;
  }
}
