import { Component, OnInit } from '@angular/core';

import { UserService, UserProfile } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile = {
    nickname: '',
    email: '',
    favoriteTypes: [],
    avatar: ''
  };

  editMode: boolean = false;
  savedMessage: boolean = false;

  availableTypes = [
    'fire', 'water', 'grass', 'electric', 'psychic',
    'dragon', 'normal', 'fighting', 'flying', 'poison',
    'ground', 'rock', 'bug', 'ghost', 'steel',
    'ice', 'dark', 'fairy'
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profile = { ...this.userService.getUserProfile() };
  }

  toggleEditMode(): void {
    if (this.editMode) {
      this.loadProfile();
    }
    this.editMode = !this.editMode;
  }

  saveProfile(): void {
    this.userService.updateUserProfile(this.profile);
    this.editMode = false;
    this.savedMessage = true;

    setTimeout(() => {
      this.savedMessage = false;
    }, 3000);
  }

  toggleType(type: string): void {
    const index = this.profile.favoriteTypes.indexOf(type);
    if (index > -1) {
      this.profile.favoriteTypes.splice(index, 1);
    } else {
      this.profile.favoriteTypes.push(type);
    }
  }

  isTypeSelected(type: string): boolean {
    return this.profile.favoriteTypes.includes(type);
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      electric: '#F8D030',
      psychic: '#F85888',
      dragon: '#7038F8',
      normal: '#A8A878',
      fighting: '#C03028',
      flying: '#A890F0',
      poison: '#A040A0',
      ground: '#E0C068',
      rock: '#B8A038',
      bug: '#A8B820',
      ghost: '#705898',
      steel: '#B8B8D0',
      ice: '#98D8D8',
      dark: '#705848',
      fairy: '#EE99AC'
    };
    return colors[type] || '#A8A878';
  }
}
