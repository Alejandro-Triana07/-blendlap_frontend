import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { BarberoLayoutComponent } from './layouts/barbero-layout/barbero-layout.component';
import { ClienteLayoutComponent } from './layouts/cliente-layout/cliente-layout.component';
import { HomeComponent } from './pages/public/home/home.component';
import { LoginComponent } from './pages/public/login/login.component';
import { RegistroComponent } from './pages/public/registro/registro.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ServiciosComponent } from './pages/admin/servicios/servicios.component';
import { ReservasComponent } from './pages/admin/reservas/reservas.component';
import { ClientesComponent } from './pages/admin/clientes/clientes.component';
import { ProductosComponent } from './pages/admin/productos/productos.component';
import { VentasComponent } from './pages/admin/ventas/ventas.component';
import { ReportesComponent } from './pages/admin/reportes/reportes.component';
import { TurnosComponent } from './pages/admin/turnos/turnos.component';
import { AgendarComponent } from './pages/public/agendar/agendar.component';
import { BarberosComponent } from './pages/admin/barberos/barberos.component';

@NgModule({
  declarations: [
    NavbarComponent,
    AppComponent,
    PublicLayoutComponent,
    AdminLayoutComponent,
    BarberoLayoutComponent,
    ClienteLayoutComponent,
    HomeComponent,
    LoginComponent,
    RegistroComponent,
    FooterComponent,
    DashboardComponent,
    ServiciosComponent,
    ReservasComponent,
    ClientesComponent,
    ProductosComponent,
    VentasComponent,
    ReportesComponent,
    TurnosComponent,
    AgendarComponent,
    BarberosComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
