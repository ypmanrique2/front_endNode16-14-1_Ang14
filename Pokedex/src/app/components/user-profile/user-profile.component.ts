import { Component, OnInit } from '@angular/core';

import { PokemonService, Pokemon } from '../../services/pokemon.service';
import { UserService, UserProfile } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

    // Modelo local del perfil del usuario
    profile: UserProfile = {
    nickname: '',
    email: '',
    favoriteTypes: [],
    avatar: '',
    favoriteMovieGenres: [] as string[]
  };

  // Estado de edición del perfil
  editMode: boolean = false;
  // Indicador visual de guardado exitoso
  savedMessage: boolean = false;
  // Control del modal selector de Pokémon
  showPokemonSelector: boolean = false;
  // Lista de Pokémon disponibles para seleccionar avatar
  availablePokemons: Pokemon[] = [];
  // Estado de carga de Pokémon
  loadingPokemons: boolean = false;
  // Término de búsqueda de Pokémon
  searchTerm: string = '';

  // Tipos de Pokémon disponibles (usados como preferencias)
  availableTypes = [
    'fire', 'water', 'grass', 'electric', 'psychic',
    'dragon', 'normal', 'fighting', 'flying', 'poison',
    'ground', 'rock', 'bug', 'ghost', 'steel',
    'ice', 'dark', 'fairy'
  ];

  // Géneros de películas disponibles como preferencias
  movieGenres = [
  'Accion',
  'Aventura',
  'Comedia',
  'Drama',
  'Fantasía',
  'Horror',
  'Romance',
  'CienciaFiccion',
  'Suspenso'
];

// Asigna colores tipo Pokémon a géneros de películas
getMovieGenreColor(genre: string): string {
  const map: { [key: string]: string } = {
    Accion: '#C03028',
    Aventura: '#78C850',
    Comedia: '#F8D030',
    Drama: '#705898',
    Fantasía: '#7038F8',
    Horror: '#705848',
    Romance: '#EE99AC',
    CienciaFiccion: '#6890F0',
    Suspenso: '#A040A0'
  };

  return map[genre] || '#A8A878';
}

// Verifica si un género de película está seleccionado
  isMovieGenreSelected(genre: string): boolean {
  return this.profile.favoriteMovieGenres.includes(genre);
}

  constructor(
    private userService: UserService,
    private pokemonService: PokemonService
  ) { }

  // Inicializa el perfil desde sessionStorage
  ngOnInit(): void {
  const storedProfile = sessionStorage.getItem('userProfile');
  if (storedProfile) {
    this.profile = JSON.parse(storedProfile);
  }
}

// Recarga el perfil original desde el servicio
  loadProfile(): void {
    this.profile = { ...this.userService.getUserProfile() };
  }

  // Activa o cancela el modo edición
  toggleEditMode(): void {
    if (this.editMode) {
      this.loadProfile();
    }
    this.editMode = !this.editMode;
  }

  // Agrega o elimina un género de película del perfil
toggleMovieGenre(genre: string): void {
  if (!this.editMode) return;

  const index = this.profile.favoriteMovieGenres.indexOf(genre);

  if (index >= 0) {
    this.profile.favoriteMovieGenres.splice(index, 1);
  } else {
    this.profile.favoriteMovieGenres.push(genre);
  }
}

// Guarda el perfil en sessionStorage
  saveProfile(): void {
  sessionStorage.setItem('userProfile', JSON.stringify(this.profile));
  this.savedMessage = true;
  this.editMode = false;

  setTimeout(() => (this.savedMessage = false), 3000);
}

// Agrega o elimina un tipo de Pokémon favorito
  toggleType(type: string): void {
    const index = this.profile.favoriteTypes.indexOf(type);
    if (index > -1) {
      this.profile.favoriteTypes.splice(index, 1);
    } else {
      this.profile.favoriteTypes.push(type);
    }
  }

  // Verifica si un tipo de Pokémon está seleccionado
  isTypeSelected(type: string): boolean {
    return this.profile.favoriteTypes.includes(type);
  }

   // Abre el selector de Pokémon para avatar
  openPokemonSelector(): void {
    this.showPokemonSelector = true;
    this.loadPopularPokemons();
  }

  // Cierra el selector de Pokémon
  closePokemonSelector(): void {
    this.showPokemonSelector = false;
    this.searchTerm = '';
  }

  // Carga Pokémon populares desde la API
  loadPopularPokemons(): void {
    this.loadingPokemons = true;
    this.pokemonService.getPokemons(50, 0).subscribe({
      next: (data) => {
        this.availablePokemons = data;
        this.loadingPokemons = false;
      },
      error: (error) => {
        console.error('Error loading pokemons:', error);
        this.loadingPokemons = false;
      }
    });
  }

  // Busca Pokémon por ID o nombre
  searchPokemon(): void {
    if (!this.searchTerm.trim()) {
      this.loadPopularPokemons();
      return;
    }

    this.loadingPokemons = true;
    const searchId = parseInt(this.searchTerm);

    if (!isNaN(searchId) && searchId > 0) {
      this.pokemonService.getPokemonById(searchId).subscribe({
        next: (pokemon) => {
          this.availablePokemons = [pokemon];
          this.loadingPokemons = false;
        },
        error: (error) => {
          console.error('Pokemon not found:', error);
          this.availablePokemons = [];
          this.loadingPokemons = false;
        }
      });
    } else {
      // Buscar por nombre en los primeros 151 elementos
      this.pokemonService.getPokemons(151, 0).subscribe({
        next: (data) => {
          this.availablePokemons = data.filter(p =>
            p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          );
          this.loadingPokemons = false;
        },
        error: (error) => {
          console.error('Error searching pokemon:', error);
          this.loadingPokemons = false;
        }
      });
    }
  }

  // Selecciona un Pokémon como avatar del perfil
  selectPokemonAvatar(pokemon: Pokemon): void {
    this.profile.avatar = pokemon.image;
    this.closePokemonSelector();
  }

  // Retorna el color asociado a un tipo de Pokémon
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
