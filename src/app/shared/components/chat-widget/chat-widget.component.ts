import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, IUsuario } from '../../../core/services/auth.service';
import {
  ChatService,
  IChatCatalogCard,
  IChatMessage,
  IChatOption,
  IChatProductCard,
} from '../../../core/services/chat.service';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy {

  /** Muñeco BARBUX en el botón flotante */
  readonly mascotUrl = 'assets/images/chat/barbux-mascot.png';
  /** Avatar pequeño en el panel del chat */
  readonly headerAvatarUrl = 'assets/images/chat/barbux-mascot.png';

  readonly sugerenciasInvitado: IChatOption[] = [
    { label: 'Ver servicios', value: 'Ver servicios' },
    { label: 'Ver productos', value: 'Ver productos' },
    { label: 'Ver barberos disponibles', value: 'Ver barberos disponibles' },
    { label: '¿Cómo hago una reserva?', value: '¿Cómo hago una reserva?' },
    { label: 'Volver al inicio', value: 'Volver al inicio' },
  ];

  readonly sugerenciasCliente: IChatOption[] = [
    { label: 'Agendar cita', value: 'Agendar cita' },
    { label: 'Mis citas', value: 'Mis citas' },
    { label: 'Ver servicios', value: 'Ver servicios' },
    { label: 'Ver productos', value: 'Ver productos' },
    { label: 'Ver barberos disponibles', value: 'Ver barberos disponibles' },
    { label: '¿Cómo hago una reserva?', value: '¿Cómo hago una reserva?' },
    { label: 'Volver al inicio', value: 'Volver al inicio' },
  ];

  sugerencias: IChatOption[] = [];

  abierto = false;
  enviando = false;
  error = '';
  input = '';
  usuario: IUsuario | null = null;
  mensajes: IChatMessage[] = [];

  @ViewChild('mensajesContainer') mensajesContainer?: ElementRef<HTMLDivElement>;

  private sub?: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.actualizarSugerencias();
    this.sub = this.authService.usuario$.subscribe(u => {
      this.usuario = u;
      this.actualizarSugerencias();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get esCliente(): boolean {
    return this.usuario?.rol === 'cliente';
  }

  get esInvitado(): boolean {
    return !this.esCliente;
  }

  private actualizarSugerencias(): void {
    this.sugerencias = [...(this.esCliente ? this.sugerenciasCliente : this.sugerenciasInvitado)];
  }

  private filtrarSugerencias(options: IChatOption[]): IChatOption[] {
    if (this.esCliente) return options;
    return options.filter((s) => {
      const v = s.value.trim().toLowerCase();
      return v !== 'agendar cita' && v !== 'mis citas';
    });
  }

  private mensajeBienvenida(): string {
    if (this.esCliente) {
      return [
        '¡Hola! Soy BARBUX, tu asistente de Blendlap.',
        '',
        'Puedo ayudarte a agendar citas, ver tus reservas, consultar servicios y productos.',
        '',
        'Usa los botones de abajo o escríbeme lo que necesites.',
      ].join('\n');
    }
    return [
      '¡Hola! Soy BARBUX, tu asistente de Blendlap.',
      '',
      'Puedo ayudarte con servicios, productos y barberos.',
      '',
      '¿En qué te ayudo?',
    ].join('\n');
  }

  private scrollAlFinal(delayMs = 0): void {
    setTimeout(() => {
      const el = this.mensajesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, delayMs);
  }

  private crearMensajeBot(res: NonNullable<IChatMessage['text']> extends string ? any : never, meta?: {
    reply: string;
    meta?: {
      products?: IChatProductCard[];
      catalogCards?: IChatCatalogCard[];
      requiresAuth?: boolean;
    };
  }): IChatMessage {
    const catalogCards = this.parseCatalogCards(meta?.meta);
    return {
      role: 'bot',
      text: meta?.reply || '',
      at: new Date(),
      products: catalogCards.length ? undefined : this.parseProducts(meta?.meta?.products),
      catalogCards: catalogCards.length ? catalogCards : undefined,
      requiresAuth: Boolean(meta?.meta?.requiresAuth),
    };
  }

  toggle(): void {
    this.abierto = !this.abierto;
    if (this.abierto && this.mensajes.length === 0) {
      this.mensajes.push({
        role: 'bot',
        text: this.mensajeBienvenida(),
        at: new Date()
      });
      this.actualizarSugerencias();
      this.scrollAlFinal();
    }
  }

  cerrar(): void {
    this.abierto = false;
  }

  irALogin(): void {
    this.cerrar();
    this.router.navigate(['/login']);
  }

  irARegistro(): void {
    this.cerrar();
    this.router.navigate(['/registro']);
  }

  enviar(): void {
    const texto = this.input.trim();
    if (!texto || this.enviando) return;

    this.input = '';
    this.error = '';
    this.mensajes.push({ role: 'user', text: texto, at: new Date() });
    this.scrollAlFinal();
    this.enviando = true;
    this.scrollAlFinal();

    this.chatService.sendMessage(texto, this.esInvitado).subscribe({
      next: (res) => {
        this.enviando = false;
        if (res.ok && res.data?.reply) {
          const botMsg: IChatMessage = {
            role: 'bot',
            text: res.data.reply,
            at: new Date(),
            requiresAuth: Boolean(res.data.meta?.requiresAuth),
          };
          const catalogCards = this.parseCatalogCards(res.data.meta);
          if (catalogCards.length) {
            botMsg.catalogCards = catalogCards;
          } else {
            const products = this.parseProducts(res.data.meta?.products);
            if (products.length) botMsg.products = products;
          }

          if (res.data.meta?.freshStart) {
            this.mensajes = [botMsg];
          } else {
            this.mensajes.push(botMsg);
          }

          const opciones = res.data.meta?.options?.length
            ? res.data.meta.options
            : (this.esCliente ? this.sugerenciasCliente : this.sugerenciasInvitado);
          this.sugerencias = this.filtrarSugerencias(opciones);

          if (catalogCards.length || botMsg.products?.length) {
            this.scrollAlFinal(150);
          }
        } else {
          this.error = res.mensaje || 'No pude obtener una respuesta.';
        }
        this.scrollAlFinal();
      },
      error: (err) => {
        this.enviando = false;
        this.error = err.error?.mensaje || 'Error al conectar con BARBUX. Verifica que el backend esté activo.';
        this.scrollAlFinal();
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviar();
    }
  }

  usarSugerencia(texto: string): void {
    if (this.enviando) return;
    this.input = texto;
    this.enviar();
  }

  tieneTarjetas(m: IChatMessage): boolean {
    return Boolean(m.catalogCards?.length || m.products?.length);
  }

  private parseCatalogCards(meta?: { catalogCards?: IChatCatalogCard[]; products?: IChatProductCard[] }): IChatCatalogCard[] {
    if (Array.isArray(meta?.catalogCards) && meta.catalogCards.length) {
      return meta.catalogCards
        .filter((c): c is IChatCatalogCard => !!c && typeof c === 'object' && 'nombre' in c)
        .map((c) => ({
          nombre: String(c.nombre || ''),
          subtitulo: c.subtitulo ? String(c.subtitulo) : undefined,
          imagen: c.imagen ?? null,
          mediaFolder: c.mediaFolder === 'barberos' || c.mediaFolder === 'servicios' ? c.mediaFolder : 'productos',
          badge: c.badge ? String(c.badge) : undefined,
        }));
    }

    const products = this.parseProducts(meta?.products);
    return products.map((p) => ({
      nombre: p.nombre,
      subtitulo: p.precio,
      imagen: p.imagen,
      mediaFolder: 'productos' as const,
      badge: p.disponible ? 'Disponible' : 'Agotado',
    }));
  }

  private parseProducts(raw: unknown): IChatProductCard[] {
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as { products?: unknown }).products)
        ? (raw as { products: IChatProductCard[] }).products
        : undefined;
    if (!list) return [];
    return list
      .filter((p): p is IChatProductCard => !!p && typeof p === 'object' && 'nombre' in p)
      .map((p) => ({
        nombre: String(p.nombre || 'Producto'),
        precio: String(p.precio || ''),
        imagen: p.imagen ?? null,
        disponible: Boolean(p.disponible),
      }));
  }
}
