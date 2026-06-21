import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private auth = inject(AuthService);
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private allowed: string[] = [];
  private rendered = false;

  @Input() set appHasRole(roles: string[] | string) {
    this.allowed = Array.isArray(roles) ? roles : [roles];
    this.update();
  }

  constructor() {
    effect(() => {
      this.auth.user();
      this.update();
    });
  }

  private update(): void {
    const ok = this.auth.hasRole(this.allowed);
    if (ok && !this.rendered) {
      this.vcr.createEmbeddedView(this.tpl);
      this.rendered = true;
    } else if (!ok && this.rendered) {
      this.vcr.clear();
      this.rendered = false;
    }
  }
}
