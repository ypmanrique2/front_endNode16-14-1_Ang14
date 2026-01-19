import { Component, OnInit } from '@angular/core';

import { forkJoin } from 'rxjs';

import { PokemonService, Pokemon } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent implements OnInit {

  // Lista base de Pokémon cargados
  pokemons: Pokemon[] = [];

  // Lista filtrada según categoría activa
  filteredPokemons: Pokemon[] = [];

  // Control de estado de carga
  loading: boolean = false;

  // Filtro activo (todos, Más fuertes, popular, etc.)
  selectedFilter: string = 'all';

  // Paginación para evitar sobrecarga inicial
  offset: number = 0;
  limit: number = 20;

  // Opciones de filtrado disponibles en UI
  pokemonTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'strongest', label: '💪 Más Fuertes' },
    { value: 'popular', label: '⭐ Más Populares' },
    { value: 'legendary', label: '👑 Legendarios' },
    { value: 'fire', label: '🔥 Fuego' },
    { value: 'water', label: '💧 Agua' },
    { value: 'grass', label: '🌿 Planta' },
    { value: 'electric', label: '⚡ Eléctrico' },
    { value: 'psychic', label: '🔮 Psíquico' },
    { value: 'dragon', label: '🐉 Dragón' }
  ];

  // Pokémon seleccionado para ver detalle
  selectedPokemon: Pokemon | null = null;

  constructor(
    // Inyección del servicio de Pokémon
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    // Carga inicial
    this.loadPokemons();
  }

  loadPokemons(): void {
    this.loading = true;

    // Obtiene Pokémon base con su paginación
    this.pokemonService.getPokemons(this.limit, this.offset).subscribe({
      next: data => {
        this.pokemons = data;
        this.filteredPokemons = data;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading pokemons:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(filterValue: string): void {
    this.selectedFilter = filterValue;
    this.loading = true;

    // Rutas de filtrado según tipo
    if (filterValue === 'all') {
      this.loadPokemons();
    } else if (filterValue === 'strongest') {
      this.loadStrongestPokemons();
    } else if (filterValue === 'popular') {
      this.loadPopularPokemons();
    } else if (filterValue === 'legendary') {
      this.loadLegendaryPokemons();
    } else {
      // Filtrado por tipo Pokémon
      this.pokemonService.getPokemonsByType(filterValue).subscribe({
        next: data => {
          this.filteredPokemons = data;
          this.loading = false;
        },
        error: error => {
          console.error('Error filtering pokemons:', error);
          this.loading = false;
        }
      });
    }
  }

  loadStrongestPokemons(): void {
    // Ordena Pokémon por suma total de estadísticas
    this.pokemonService.getPokemons(50, 0).subscribe({
      next: data => {
        this.filteredPokemons = data
          .map(p => ({
            ...p,
            totalStats: p.stats.reduce((sum, stat) => sum + stat.value, 0)
          }))
          .sort((a: any, b: any) => b.totalStats - a.totalStats)
          .slice(0, 20);

        this.loading = false;
      },
      error: error => {
        console.error('Error loading strongest pokemons:', error);
        this.loading = false;
      }
    });
  }

  loadPopularPokemons(): void {
    // Pokémon más conocidos (Generación 1)
    this.pokemonService.getPokemons(20, 0).subscribe({
      next: data => {
        this.filteredPokemons = data;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading popular pokemons:', error);
        this.loading = false;
      }
    });
  }

  loadLegendaryPokemons(): void {
    // IDs de Pokémon legendarios
    const legendaryIds = [
      144, 145, 146, 150, 151,
      243, 244, 245,
      249, 250, 251,
      377, 378, 379,
      380, 381, 382, 383, 384, 385
    ];

    this.loading = true;

    // Peticiones paralelas
    const requests = legendaryIds.map(id =>
      this.pokemonService.getPokemonById(id)
    );

    forkJoin(requests).subscribe({
      next: data => {
        this.filteredPokemons = data;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading legendary pokemons:', error);
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    // Incrementa paginación
    this.offset += this.limit;
    this.loading = true;

    this.pokemonService.getPokemons(this.limit, this.offset).subscribe({
      next: data => {
        this.pokemons = [...this.pokemons, ...data];
        this.filteredPokemons = [...this.filteredPokemons, ...data];
        this.loading = false;
      },
      error: error => {
        console.error('Error loading more pokemons:', error);
        this.loading = false;
      }
    });
  }

  openPokemonDetail(pokemon: Pokemon): void {
    // Abre el modal del detalle
    this.selectedPokemon = pokemon;
  }

  closeDetail(): void {
    // Cierra el modal
    this.selectedPokemon = null;
  }

  getTypeColor(type: string): string {
    // Mapa de colores por tipo Pokémon
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
