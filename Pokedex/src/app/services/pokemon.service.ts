import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

// Modelo de dominio Pokémon usado en toda la app
export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  height: number;
  weight: number;
  stats: { name: string; value: number }[];
}

@Injectable({
  // Servicio singleton para consumo de la PokeAPI
  providedIn: 'root'
})
export class PokemonService {

  // URL base de la PokeAPI
  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  //Obtiene un Pokémon por ID
  getPokemonById(id: number): Observable<Pokemon> {
    return this.http
      .get<any>(`${this.baseUrl}/pokemon/${id}`)
      .pipe(
        // Normaliza la respuesta al modelo interno
        map(data => this.formatPokemon(data))
      );
  }

  // Obtiene una lista paginada de Pokémon
  getPokemons(limit = 20, offset = 0): Observable<Pokemon[]> {
    return this.http
      .get<{ results: { url: string }[] }>(
        `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`
      )
      .pipe(
        // Convierte cada URL en un request individual
        switchMap(response => {
          const requests: Observable<any | null>[] =
            response.results.map(p =>
              this.http.get<any>(p.url).pipe(
                // Manejo de errores por Pokémon individual
                catchError(() => of(null))
              )
            );

          // Ejecuta todos los requests en paralelo
          return forkJoin(requests) as Observable<(any | null)[]>;
        }),
        // Filtra respuestas inválidas y formatea datos
        map(pokemons =>
          pokemons
            .filter((p): p is any => p !== null)
            .map(p => this.formatPokemon(p))
        )
      );
  }

  // Obtiene Pokémon filtrados por tipo
  getPokemonsByType(type: string): Observable<Pokemon[]> {
    return this.http
      .get<{ pokemon: { pokemon: { url: string } }[] }>(
        `${this.baseUrl}/type/${type}`
      )
      .pipe(
        // Limita resultados y obtiene detalle de cada Pokémon
        switchMap(response => {
          const requests: Observable<any | null>[] =
            response.pokemon
              .slice(0, 20)
              .map(p =>
                this.http.get<any>(p.pokemon.url).pipe(
                  catchError(() => of(null))
                )
              );

          return forkJoin(requests) as Observable<(any | null)[]>;
        }),
        // Limpia errores y normaliza resultados
        map(pokemons =>
          pokemons
            .filter((p): p is any => p !== null)
            .map(p => this.formatPokemon(p))
        )
      );
  }

  // Obtiene los Pokémon con mayor poder total
  getStrongestPokemons(limit = 20): Observable<Pokemon[]> {
    return this.getPokemons(50, 0).pipe(
      map(pokemons =>
        pokemons
          // Calcula suma total de stats
          .map(p => ({
            ...p,
            totalStats: p.stats.reduce((sum, s) => sum + s.value, 0)
          }))
          // Ordena de mayor a menor poder
          .sort((a, b) => b.totalStats - a.totalStats)
          // Limita resultados
          .slice(0, limit)
      )
    );
  }

  // Obtiene Pokémon populares (Generación 1)
  getPopularPokemons(): Observable<Pokemon[]> {
    return this.getPokemons(20, 0);
  }

  // Obtiene Pokémon legendarios por IDs conocidos
  getLegendaryPokemons(): Observable<Pokemon[]> {
    const legendaryIds = [
      144, 145, 146, 150, 151,
      243, 244, 245,
      249, 250, 251,
      377, 378, 379,
      380, 381, 382, 383, 384, 385
    ];

    // Ejecuta todos los requests en paralelo
    return forkJoin(
      legendaryIds.map(id => this.getPokemonById(id))
    );
  }

  // Normaliza la respuesta cruda de la API
  private formatPokemon(data: any): Pokemon {
    return {
      id: data.id,
      name: data.name,
      // Prioriza artwork oficial
      image:
        data.sprites.other['official-artwork'].front_default ??
        data.sprites.front_default,
      types: data.types.map((t: any) => t.type.name),
      height: data.height,
      weight: data.weight,
      stats: data.stats.map((s: any) => ({
        name: s.stat.name,
        value: s.base_stat
      }))
    };
  }
}
