import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  anio = new Date().getFullYear();

  scrollTo(seccion: string): void {
    const elemento = document.getElementById(seccion);
    if (elemento) {
      const offset = 80;
      const top = elemento.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}