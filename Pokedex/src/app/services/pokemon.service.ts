import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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

  getPokemons(limit: number = 20, offset: number = 0): Observable<Pokemon[]> {
    return this.http
      .get<any>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`)
      .pipe(
        switchMap(response => {
          const requests = response.results.map((p: any) =>
            this.http.get<any>(p.url)
          );
          return forkJoin(requests) as Observable<any[]>;
        }),
        map((pokemons: any[]) =>
          pokemons.map((p: any) => this.formatPokemon(p))
        )
      );
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http
      .get<any>(`${this.baseUrl}/pokemon/${id}`)
      .pipe(map((p: any) => this.formatPokemon(p)));
  }

  getPokemonsByType(type: string): Observable<Pokemon[]> {
    return this.http
      .get<any>(`${this.baseUrl}/type/${type}`)
      .pipe(
        switchMap(response => {
          const requests = response.pokemon
            .slice(0, 20)
            .map((p: any) =>
              this.http.get<any>(p.pokemon.url)
            );
          return forkJoin(requests) as Observable<any[]>;
        }),
        map((pokemons: any[]) =>
          pokemons.map((p: any) => this.formatPokemon(p))
        )
      );
  }

  private formatPokemon(data: any): Pokemon {
    return {
      id: data.id,
      name: data.name,
      image:
        data.sprites.other['official-artwork'].front_default ||
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

  getPokemonsByType(type: string): Observable<Pokemon[]> {
    return this.http.get<any>(`${this.baseUrl}/type/${type}`).pipe(
      switchMap(response => {
        const requests = response.pokemon.slice(0, 20).map((p: any) =>
          this.http.get<any>(p.pokemon.url)
        );
        return forkJoin(requests);
      }),
      map(pokemons => pokemons.map(p => this.formatPokemon(p)))
    );
  }

  private formatPokemon(data: any): Pokemon {
    return {
      id: data.id,
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
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
