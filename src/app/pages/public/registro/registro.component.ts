import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {

  nombre = '';
  apellido = '';
  correo_electronico = '';
  telefono = '';
  contrasena = '';
  confirmarContrasena = '';

  error = '';
  cargando = false;
  mostrarPassword = false;
  mostrarConfirmar = false;
  returnUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  private redirigir(rol: string): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }
    switch (rol) {
      case 'admin': this.router.navigate(['/admin/dashboard']); break;
      case 'barbero': this.router.navigate(['/barbero/dashboard']); break;
      case 'cliente': this.router.navigate(['/']); break;
      default: this.router.navigate(['/']);
    }
  }

  validarContrasena(contrasena: string): string | null {
    if (contrasena.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(contrasena)) return 'Debe tener al menos una mayúscula';
    if (!/[a-z]/.test(contrasena)) return 'Debe tener al menos una minúscula';
    if (!/[0-9]/.test(contrasena)) return 'Debe tener al menos un número';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(contrasena)) return 'Debe tener al menos un carácter especial';
    return null;
  }

  validarCorreo(correo: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(correo);
  }

  registro(): void {
    if (!this.nombre || !this.apellido || !this.correo_electronico || !this.contrasena || !this.confirmarContrasena) {
      this.error = 'Por favor completa todos los campos';
      return;
    }
    if (!this.validarCorreo(this.correo_electronico)) {
      this.error = 'Ingresa un correo electrónico válido';
      return;
    }
    const errorPassword = this.validarContrasena(this.contrasena);
    if (errorPassword) {
      this.error = errorPassword;
      return;
    }
    if (this.contrasena !== this.confirmarContrasena) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.registro({
      nombre: this.nombre,
      apellido: this.apellido,
      correo_electronico: this.correo_electronico,
      telefono: this.telefono,
      contrasena: this.contrasena,
      rol: 'cliente'
    }).subscribe({
      next: (res) => {
        this.cargando = false;
        this.redirigir(res.usuario.rol);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al registrarse';
      }
    });
  }

  togglePassword(): void { this.mostrarPassword = !this.mostrarPassword; }
  toggleConfirmar(): void { this.mostrarConfirmar = !this.mostrarConfirmar; }
  tieneMayuscula(): boolean { return /[A-Z]/.test(this.contrasena); }
  tieneNumero(): boolean { return /[0-9]/.test(this.contrasena); }
  tieneEspecial(): boolean { return /[!@#$%^&*(),.?":{}|<>]/.test(this.contrasena); }
  tieneLength(): boolean { return this.contrasena.length >= 8; }

  getStrengthClass(): string {
    let score = 0;
    if (this.tieneLength()) score++;
    if (this.tieneMayuscula()) score++;
    if (this.tieneNumero()) score++;
    if (this.tieneEspecial()) score++;
    if (/[a-z]/.test(this.contrasena)) score++;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }
}