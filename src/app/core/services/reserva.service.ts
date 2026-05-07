import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IBarbero {
  id_usuario: number;
  nombre: string;
  apellido: string;
}

export interface ISlot {
  hora: string;
  disponible: boolean;
}

export interface IDisponibilidad {
  id_barbero: number;
  fecha: string;
  disponible: boolean;
  slots: ISlot[];
}

export interface ICrearReserva {
  id_cliente: number;
  id_barbero: number;
  fecha: string;
  hora: string;
  servicios: number[];
}

@Injectable({ providedIn: 'root' })
export class ReservaService {

  private url = `${environment.apiUrl}/reservas`;
  private urlUsuarios = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getBarberos(): Observable<{ ok: boolean; data: IBarbero[] }> {
    return this.http.get<{ ok: boolean; data: IBarbero[] }>(`${this.urlUsuarios}/barberos`);
  }

  getDisponibilidad(id_barbero: number, fecha: string, duracion_total: number): Observable<{ ok: boolean; data: IDisponibilidad }> {
    return this.http.get<{ ok: boolean; data: IDisponibilidad }>(
      `${this.url}/disponibilidad?id_barbero=${id_barbero}&fecha=${fecha}&duracion_total=${duracion_total}`
    );
  }

  crear(data: ICrearReserva): Observable<{ ok: boolean; data: any }> {
    return this.http.post<{ ok: boolean; data: any }>(this.url, data);
  }
}