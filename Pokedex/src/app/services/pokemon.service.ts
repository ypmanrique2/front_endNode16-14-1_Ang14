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

  constructor(private http: HttpClient) { }

  // Obtener el listado general con una paginación
  getPokemons(limit: number = 20, offset: number = 0): Observable<Pokemon[]> {
    return this.http
      .get<any>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`)
      .pipe(
        switchMap(response => {
          // Se Crea un array de observables para obtener los detalles de cada item
          const requests = response.results.map((p: any) =>
            this.http.get<any>(p.url)
          );
          // forkJoin espera a que todos se completen
          return forkJoin(requests) as Observable<any[]>;
        }),
        map((pokemons: any[]) =>
          pokemons.map((p: any) => this.formatPokemon(p))
        )
      );
  }

  // Obtener un solo Pokemon por ID
  getPokemonById(id: number): Observable<Pokemon> {
    return this.http
      .get<any>(`${this.baseUrl}/pokemon/${id}`)
      .pipe(map((p: any) => this.formatPokemon(p)));
  }

  // Obtener Pokemons filtrados por tipos
  getPokemonsByType(type: string): Observable<Pokemon[]> {
    return this.http
      .get<any>(`${this.baseUrl}/type/${type}`)
      .pipe(
        switchMap(response => {
          // Limitamos a 20 para no saturar la vista inicial
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

  // Método privado para formatear la data cruda de la API a la interfaz
  private formatPokemon(data: any): Pokemon {
    return {
      id: data.id,
      name: data.name,
      // Se prioriza el arte oficial, si no existe se usa el sprite por defecto
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
