import { Component } from '@angular/core';

@Component({
  selector: 'app-public-layout',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <app-carrito-drawer></app-carrito-drawer>
    <app-chat-widget></app-chat-widget>
  `
})
export class PublicLayoutComponent {}