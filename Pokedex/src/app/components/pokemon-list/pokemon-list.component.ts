import { Component, OnInit } from '@angular/core';

import { PokemonService, Pokemon } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent implements OnInit {
  pokemons: Pokemon[] = [];
  filteredPokemons: Pokemon[] = [];
  loading: boolean = false;
  selectedFilter: string = 'all';
  offset: number = 0;
  limit: number = 20;

  pokemonTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'fire', label: 'Fuego' },
    { value: 'water', label: 'Agua' },
    { value: 'grass', label: 'Planta' },
    { value: 'electric', label: 'Eléctrico' },
    { value: 'psychic', label: 'Psíquico' },
    { value: 'dragon', label: 'Dragón' }
  ];

  selectedPokemon: Pokemon | null = null;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.loadPokemons();
  }

  loadPokemons(): void {
    this.loading = true;
    this.pokemonService.getPokemons(this.limit, this.offset).subscribe({
      next: (data) => {
        this.pokemons = data;
        this.filteredPokemons = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pokemons:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(filterValue: string): void {
    this.selectedFilter = filterValue;
    this.loading = true;

    if (filterValue === 'all') {
      this.loadPokemons();
    } else {
      this.pokemonService.getPokemonsByType(filterValue).subscribe({
        next: (data) => {
          this.filteredPokemons = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error filtering pokemons:', error);
          this.loading = false;
        }
      });
    }
  }

  loadMore(): void {
    this.offset += this.limit;
    this.loading = true;

    this.pokemonService.getPokemons(this.limit, this.offset).subscribe({
      next: (data) => {
        this.pokemons = [...this.pokemons, ...data];
        this.filteredPokemons = [...this.filteredPokemons, ...data];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading more pokemons:', error);
        this.loading = false;
      }
    });
  }

  openPokemonDetail(pokemon: Pokemon): void {
    this.selectedPokemon = pokemon;
  }

  closeDetail(): void {
    this.selectedPokemon = null;
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
