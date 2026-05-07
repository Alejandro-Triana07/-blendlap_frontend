import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ServicioService, IServicio } from '../../../core/services/servicio.service';
import { ReservaService, IBarbero, ISlot } from '../../../core/services/reserva.service';

type Paso = 'servicio' | 'barbero' | 'fecha' | 'confirmacion';

@Component({
  selector: 'app-agendar',
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.scss']
})
export class AgendarComponent implements OnInit {

  pasoActual: Paso = 'servicio';
  pasos: Paso[] = ['servicio', 'barbero', 'fecha', 'confirmacion'];

  servicios: IServicio[] = [];
  barberos: IBarbero[] = [];
  slots: ISlot[] = [];

  serviciosSeleccionados: IServicio[] = [];
  barberoSeleccionado: IBarbero | null = null;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';

  cargando = false;
  cargandoSlots = false;
  error = '';
  reservaConfirmada = false;

  mesActual: Date = new Date();
  diasCalendario: { fecha: Date | null; disponible: boolean }[] = [];
  hoy: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private servicioService: ServicioService,
    private reservaService: ReservaService
  ) { }

  ngOnInit(): void {
    // Recuperar reserva pendiente si viene del login
    const pendiente = sessionStorage.getItem('reserva_pendiente');
    if (pendiente) {
      const data = JSON.parse(pendiente);
      this.serviciosSeleccionados = data.servicios;
      this.barberoSeleccionado = data.barbero;
      this.fechaSeleccionada = data.fecha;
      this.horaSeleccionada = data.hora;
      this.pasoActual = 'confirmacion';
      sessionStorage.removeItem('reserva_pendiente');
    }

    this.cargarServicios();
    this.cargarBarberos();
    this.generarCalendario();

    this.route.queryParams.subscribe(params => {
      if (params['barbero']) {
        const id = parseInt(params['barbero']);
        this.reservaService.getBarberos().subscribe((res: any) => {
          const b = res.data.find((b: any) => b.id_usuario === id);
          if (b) {
            this.barberoSeleccionado = b;
            this.pasoActual = 'servicio';
          }
        });
      }
      if (params['servicio']) {
        const id = parseInt(params['servicio']);
        this.servicioService.getAll().subscribe((res: any) => {
          const s = res.data.find((s: any) => s.id_servicio === id);
          if (s) {
            this.serviciosSeleccionados = [s];
            this.pasoActual = 'barbero';
          }
        });
      }
    });
  }

  cargarServicios(): void {
    this.servicioService.getAll().subscribe({
      next: (res) => this.servicios = res.data,
      error: () => this.error = 'Error al cargar servicios'
    });
  }

  cargarBarberos(): void {
    this.reservaService.getBarberos().subscribe({
      next: (res) => this.barberos = res.data,
      error: () => this.error = 'Error al cargar barberos'
    });
  }

  toggleServicio(servicio: IServicio): void {
    const idx = this.serviciosSeleccionados.findIndex(s => s.id_servicio === servicio.id_servicio);
    if (idx === -1) {
      this.serviciosSeleccionados.push(servicio);
    } else {
      this.serviciosSeleccionados.splice(idx, 1);
    }
  }

  isServicioSeleccionado(servicio: IServicio): boolean {
    return this.serviciosSeleccionados.some(s => s.id_servicio === servicio.id_servicio);
  }

  get duracionTotal(): number {
    return this.serviciosSeleccionados.reduce((sum, s) => sum + s.duracion, 0);
  }

  get precioTotal(): number {
    return this.serviciosSeleccionados.reduce((sum, s) => sum + Number(s.precio), 0);
  }

  generarCalendario(): void {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();

    this.diasCalendario = [];

    for (let i = 0; i < primerDia; i++) {
      this.diasCalendario.push({ fecha: null, disponible: false });
    }

    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = new Date(año, mes, d);
      const pasado = fecha < new Date(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate());
      this.diasCalendario.push({ fecha, disponible: !pasado });
    }
  }

  mesAnterior(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.generarCalendario();
  }

  mesSiguiente(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
    this.generarCalendario();
  }

  get nombreMes(): string {
    return this.mesActual.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  }

  seleccionarFecha(dia: { fecha: Date | null; disponible: boolean }): void {
    if (!dia.fecha || !dia.disponible) return;
    const f = dia.fecha;
    this.fechaSeleccionada = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
    this.horaSeleccionada = '';
    this.cargarSlots();
  }

  esDiaSeleccionado(dia: { fecha: Date | null }): boolean {
    if (!dia.fecha || !this.fechaSeleccionada) return false;
    const f = dia.fecha;
    const fStr = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
    return fStr === this.fechaSeleccionada;
  }

  cargarSlots(): void {
    if (!this.barberoSeleccionado || !this.fechaSeleccionada) return;
    this.cargandoSlots = true;
    this.reservaService.getDisponibilidad(
      this.barberoSeleccionado.id_usuario,
      this.fechaSeleccionada,
      this.duracionTotal || 30
    ).subscribe({
      next: (res) => {
        this.slots = res.data.disponible ? res.data.slots : [];
        this.cargandoSlots = false;
      },
      error: () => {
        this.error = 'Error al cargar disponibilidad';
        this.cargandoSlots = false;
      }
    });
  }

  get pasoIndex(): number {
    return this.pasos.indexOf(this.pasoActual);
  }

  siguientePaso(): void {
    const idx = this.pasoIndex;
    if (idx < this.pasos.length - 1) {
      this.pasoActual = this.pasos[idx + 1];
      if (this.pasoActual === 'fecha') this.cargarSlots();
    }
  }

  pasoAnterior(): void {
    const idx = this.pasoIndex;
    if (idx > 0) this.pasoActual = this.pasos[idx - 1];
  }

  puedeAvanzar(): boolean {
    switch (this.pasoActual) {
      case 'servicio': return this.serviciosSeleccionados.length > 0;
      case 'barbero': return !!this.barberoSeleccionado;
      case 'fecha': return !!this.fechaSeleccionada && !!this.horaSeleccionada;
      default: return false;
    }
  }

  confirmarReserva(): void {
    if (!this.authService.isLoggedIn()) {
      sessionStorage.setItem('reserva_pendiente', JSON.stringify({
        servicios: this.serviciosSeleccionados,
        barbero: this.barberoSeleccionado,
        fecha: this.fechaSeleccionada,
        hora: this.horaSeleccionada
      }));
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/agendar' } });
      return;
    }

    const usuario = this.authService.getUsuario();
    if (!usuario) return;

    this.cargando = true;
    this.error = '';

    const data = {
      id_cliente: usuario.id_usuario,
      id_barbero: this.barberoSeleccionado!.id_usuario,
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      servicios: this.serviciosSeleccionados.map(s => s.id_servicio!)
    };

    this.reservaService.crear(data).subscribe({
      next: () => {
        this.cargando = false;
        this.reservaConfirmada = true;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al crear la reserva';
        this.cargando = false;
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const [año, mes, dia] = fecha.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} de ${año}`;
  }

  irAlHome(): void {
    this.router.navigate(['/']);
  }
}