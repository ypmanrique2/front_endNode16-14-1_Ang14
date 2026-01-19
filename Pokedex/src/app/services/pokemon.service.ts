import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

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
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemonById(id: number): Observable<Pokemon> {
  return this.http.get<any>(`${this.baseUrl}/pokemon/${id}`).pipe(
    map(data => this.formatPokemon(data))
  );
}

  getPokemons(limit = 20, offset = 0): Observable<Pokemon[]> {
    return this.http
      .get<{ results: { url: string }[] }>(
        `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`
      )
      .pipe(
        switchMap(response => {
          const requests: Observable<any | null>[] = response.results.map(p =>
            this.http.get<any>(p.url).pipe(
              catchError(() => of(null))
            )
          );

          return forkJoin(requests) as Observable<(any | null)[]>;
        }),
        map((pokemons: (any | null)[]) =>
          pokemons
            .filter((p): p is any => p !== null)
            .map(p => this.formatPokemon(p))
        )
      );
  }

  getPokemonsByType(type: string): Observable<Pokemon[]> {
    return this.http
      .get<{ pokemon: { pokemon: { url: string } }[] }>(
        `${this.baseUrl}/type/${type}`
      )
      .pipe(
        switchMap(response => {
          const requests: Observable<any | null>[] = response.pokemon
            .slice(0, 20)
            .map(p =>
              this.http.get<any>(p.pokemon.url).pipe(
                catchError(() => of(null))
              )
            );

          return forkJoin(requests) as Observable<(any | null)[]>;
        }),
        map((pokemons: (any | null)[]) =>
          pokemons
            .filter((p): p is any => p !== null)
            .map(p => this.formatPokemon(p))
        )
      );
  }

  private formatPokemon(data: any): Pokemon {
    return {
      id: data.id,
      name: data.name,
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
