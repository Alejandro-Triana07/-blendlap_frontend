import { Pipe, PipeTransform } from '@angular/core';

const BASE = 'http://localhost:3001/images';

@Pipe({ name: 'imgUrl' })
export class ImgUrlPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return 'assets/images/no-img.png';
    if (valor.startsWith('http') || valor.startsWith('data:')) return valor;
    let tipo = valor.split('_')[0]; // productos | servicios | barberos | clientes
    if (tipo === 'servicio') tipo = 'servicios';
    if (tipo === 'barbero') tipo = 'barberos';
    if (tipo === 'producto') tipo = 'productos';
    if (tipo === 'cliente') tipo = 'clientes';
    return `${BASE}/${tipo}/${valor}`;
  }
}
