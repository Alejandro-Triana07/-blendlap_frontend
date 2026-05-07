import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { HomeComponent } from './pages/public/home/home.component';
import { LoginComponent } from './pages/public/login/login.component';
import { RegistroComponent } from './pages/public/registro/registro.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ReservasComponent } from './pages/admin/reservas/reservas.component';
import { ClientesComponent } from './pages/admin/clientes/clientes.component';
import { ServiciosComponent } from './pages/admin/servicios/servicios.component';
import { ProductosComponent } from './pages/admin/productos/productos.component';
import { VentasComponent } from './pages/admin/ventas/ventas.component';
import { TurnosComponent } from './pages/admin/turnos/turnos.component';
import { ReportesComponent } from './pages/admin/reportes/reportes.component';
import { AgendarComponent } from './pages/public/agendar/agendar.component';
import { authGuard } from './core/guards/auth.guard';
import { BarberosComponent } from './pages/admin/barberos/barberos.component';

const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      // Agendar — layout propio
    ]
  },
  { path: 'agendar', component: AgendarComponent },

  // Login y registro
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  // Admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { rol: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reservas', component: ReservasComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'servicios', component: ServiciosComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'ventas', component: VentasComponent },
      { path: 'turnos', component: TurnosComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'barberos', component: BarberosComponent },
    ]
  },

  // Barbero
  {
    path: 'barbero',
    canActivate: [authGuard],
    data: { rol: 'barbero' },
    children: [
      { path: 'dashboard', component: HomeComponent }
    ]
  },

  // Cliente
  {
    path: 'cliente',
    canActivate: [authGuard],
    data: { rol: 'cliente' },
    children: [
      { path: 'dashboard', component: HomeComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }