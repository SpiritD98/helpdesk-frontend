import { Component, ChangeDetectionStrategy, output, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';
import { HasRoleDirective } from '../../directives/has-role.directive';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, HasRoleDirective],
  template: `
    <aside
      [class.collapsed]="collapsed()"
      class="sidebar-container flex flex-col h-screen text-white transition-all duration-[250ms] ease-in-out overflow-hidden shrink-0"
    >
      <!-- HEADER -->
      <div class="header flex items-center justify-between px-4 h-14 shrink-0 border-b border-white/10">
        <div class="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">support_agent</mat-icon>
          <span class="title font-bold text-lg tracking-wide">HelpDesk</span>
        </div>
        <button (click)="toggle()" class="toggle-btn p-1 rounded hover:bg-white/10 transition shrink-0" aria-label="Toggle sidebar">
          <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px]">{{ collapsed() ? 'menu' : 'close' }}</mat-icon>
        </button>
      </div>

      <!-- PERFIL -->
      <div *ngIf="!collapsed()" class="profile flex flex-col items-center py-5 px-4 border-b border-white/10 shrink-0">
        <div
          class="avatar w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2"
          [style.background-color]="'#2563EB'"
        >
          {{ getInitials() }}
        </div>
        <span class="name font-medium text-sm text-center leading-tight">{{ auth.getFullName() }}</span>
        <span class="role text-xs uppercase mt-1 tracking-wider" style="color: rgba(255,255,255,0.6);">{{ auth.user()?.rol }}</span>
      </div>

      <!-- NAVEGACIÓN -->
      <nav class="nav flex-1 overflow-y-auto py-2">
        <ul class="flex flex-col gap-0.5 px-2">
          <li>
            <a
              routerLink="/dashboard"
              routerLinkActive="active-nav-item"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-[15px] transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">dashboard</mat-icon>
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/tickets"
              routerLinkActive="active-nav-item"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-[15px] transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">confirmation_number</mat-icon>
              <span class="nav-text">Tickets</span>
            </a>
          </li>
          <li *appHasRole="['ADMIN_OWNER', 'ADMIN_EMPRESA']">
            <a
              routerLink="/usuarios"
              routerLinkActive="active-nav-item"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-[15px] transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">group</mat-icon>
              <span class="nav-text">Usuarios</span>
            </a>
          </li>
          <li *appHasRole="['ADMIN_OWNER']">
            <a
              routerLink="/empresas"
              routerLinkActive="active-nav-item"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-[15px] transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">business</mat-icon>
              <span class="nav-text">Empresas</span>
            </a>
          </li>
          <li *appHasRole="['ADMIN_OWNER', 'ADMIN_EMPRESA']">
            <a
              routerLink="/categorias"
              routerLinkActive="active-nav-item"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-[15px] transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">category</mat-icon>
              <span class="nav-text">Categorías</span>
            </a>
          </li>
          <li *appHasRole="['ADMIN_OWNER', 'ADMIN_EMPRESA']">
            <a
              routerLink="/problemas"
              routerLinkActive="active-nav-item"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-[15px] transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">report_problem</mat-icon>
              <span class="nav-text">Problemas</span>
            </a>
          </li>
          <li *appHasRole="['ADMIN_OWNER']">
            <a
              routerLink="/roles"
              routerLinkActive="active-nav-item"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-[15px] transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">shield</mat-icon>
              <span class="nav-text">Roles</span>
            </a>
          </li>
          <li *appHasRole="['ADMIN_OWNER']">
            <a
              routerLink="/permisos"
              routerLinkActive="active-nav-item"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-[15px] transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">key</mat-icon>
              <span class="nav-text">Permisos</span>
            </a>
          </li>
          <li *appHasRole="['ADMIN_OWNER', 'ADMIN_EMPRESA']">
            <a
              routerLink="/reportes"
              routerLinkActive="active-nav-item"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-[15px] transition-colors hover:bg-white/[0.08] whitespace-nowrap"
            >
              <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">bar_chart</mat-icon>
              <span class="nav-text">Reportes</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- FOOTER -->
      <div *ngIf="!collapsed()" class="footer flex flex-col gap-2 px-4 py-3 border-t border-white/10 shrink-0">
        <div class="session-timer flex items-center gap-2 text-sm" [class.blink]="isBlink()" [style.color]="sessionColor()">
          <mat-icon class="icon !text-[18px] !w-[18px] !h-[18px] shrink-0">schedule</mat-icon>
          <span class="whitespace-nowrap">{{ sessionRemaining() }}</span>
        </div>
        <button
          (click)="onLogout()"
          class="logout-btn flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px] shrink-0">logout</mat-icon>
          <span class="whitespace-nowrap">Cerrar sesión</span>
        </button>
      </div>

      <!-- Logout cuando está colapsado (solo ícono) -->
      <div *ngIf="collapsed()" class="flex flex-col items-center py-3 border-t border-white/10 shrink-0">
        <button
          (click)="onLogout()"
          class="p-2 rounded-md hover:bg-red-500/15 transition-colors"
          title="Cerrar sesión"
        >
          <mat-icon class="icon !text-[22px] !w-[22px] !h-[22px]">logout</mat-icon>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }

    .sidebar-container {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 50;
      width: 260px;
      height: 100vh;
      background-color: #1B3A6B;
    }

    .sidebar-container.collapsed {
      width: 64px;
    }

    .collapsed .header {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      justify-content: center;
    }

    .collapsed .title,
    .collapsed .nav-text {
      display: none;
    }

    .collapsed .nav-link {
      justify-content: center;
      padding-left: 0;
      padding-right: 0;
    }

    .collapsed .icon {
      margin: 0;
    }

    .nav-link {
      color: #FFFFFF;
      font-weight: 500;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }

    .active-nav-item {
      background-color: #2563EB !important;
      border-left: 3px solid #60A5FA !important;
      padding-left: calc(0.75rem - 3px);
    }

    .logout-btn {
      color: #FFFFFF;
      background-color: transparent;
      border: none;
      cursor: pointer;
    }

    .logout-btn:hover {
      background-color: rgba(239, 68, 68, 0.15);
      color: #FCA5A5;
    }

    .session-timer.blink {
      animation: blink-animation 1s infinite;
    }

    @keyframes blink-animation {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* Scrollbar styling for nav */
    .nav::-webkit-scrollbar {
      width: 4px;
    }
    .nav::-webkit-scrollbar-track {
      background: transparent;
    }
    .nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 2px;
    }
  `],
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly STORAGE_KEY = 'helpdesk_auth';
  private readonly TS_KEY = 'helpdesk_auth_ts';

  protected auth = inject(AuthService);

  collapsed = signal(false);
  collapsedChange = output<boolean>();

  sessionRemaining = signal<string>('');
  sessionColor = signal<string>('rgba(255,255,255,0.6)');
  isBlink = signal(false);

  private timerId: ReturnType<typeof setInterval> | null = null;
  private resizeHandler = () => this.checkViewport();

  ngOnInit(): void {
    this.checkViewport();
    window.addEventListener('resize', this.resizeHandler);
    this.startSessionTimer();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.timerId) clearInterval(this.timerId);
  }

  toggle(): void {
    this.collapsed.update(v => !v);
    this.collapsedChange.emit(this.collapsed());
  }

  getInitials(): string {
    const u = this.auth.user();
    if (!u) return '';
    const n = (u.nombres || '').trim();
    const a = (u.apellidos || '').trim();
    const first = n.charAt(0).toUpperCase();
    const second = a.charAt(0).toUpperCase();
    return `${first}${second}`;
  }

  onLogout(): void {
    this.auth.logout();
  }

  private checkViewport(): void {
    const isNarrow = window.innerWidth < 1024;
    if (isNarrow && !this.collapsed()) {
      this.collapsed.set(true);
      this.collapsedChange.emit(true);
    }
  }

  private startSessionTimer(): void {
    this.updateSessionTimer();
    this.timerId = setInterval(() => this.updateSessionTimer(), 60000);
  }

  private updateSessionTimer(): void {
    try {
      const storedRaw = sessionStorage.getItem(this.STORAGE_KEY);
      const tsRaw = sessionStorage.getItem(this.TS_KEY);
      if (!storedRaw || !tsRaw) {
        this.sessionRemaining.set('Sesión: --');
        return;
      }

      const stored = JSON.parse(storedRaw);
      const loginedAt = Number(tsRaw);
      let expiresInMs = Number(stored.expiresIn) || 0;
      if (expiresInMs > 0 && expiresInMs < 1_000_000) expiresInMs *= 1000;
      const msRestantes = (loginedAt + expiresInMs) - Date.now();

      if (msRestantes <= 0) {
        this.sessionRemaining.set('Sesión: expirada');
        this.auth.logout();
        return;
      }

      const horas = Math.floor(msRestantes / 3_600_000);
      const minutos = Math.floor((msRestantes % 3_600_000) / 60_000);
      this.sessionRemaining.set(`Sesión: ${horas}h ${minutos}m restantes`);

      // Color logic
      const totalMin = horas * 60 + minutos;
      if (totalMin < 10) {
        this.sessionColor.set('#EF4444');
        this.isBlink.set(true);
      } else if (totalMin < 60) {
        this.sessionColor.set('#FCA5A5');
        this.isBlink.set(false);
      } else {
        this.sessionColor.set('rgba(255,255,255,0.6)');
        this.isBlink.set(false);
      }
    } catch {
      this.sessionRemaining.set('Sesión: --');
    }
  }
}
