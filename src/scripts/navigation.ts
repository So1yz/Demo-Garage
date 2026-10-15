/**
 * Autora Automotive — Navigation & Header Controller
 * Handles sticky header states, accessible mobile navigation drawer,
 * focus trapping, Escape-to-close, and background scroll locking.
 */

export interface NavigationOptions {
  headerSelector?: string;
  toggleSelector?: string;
  drawerSelector?: string;
  backdropSelector?: string;
  closeBtnSelector?: string;
  scrollThreshold?: number;
}

export class NavigationController {
  private header: HTMLElement | null;
  private toggleBtn: HTMLElement | null;
  private drawer: HTMLElement | null;
  private backdrop: HTMLElement | null;
  private closeBtn: HTMLElement | null;
  private scrollThreshold: number;
  private isOpen: boolean = false;
  private previouslyFocusedElement: HTMLElement | null = null;
  private originalBodyOverflow: string = '';

  constructor(options: NavigationOptions = {}) {
    this.header = document.querySelector(options.headerSelector || '.site-header');
    this.toggleBtn = document.querySelector(options.toggleSelector || '[data-drawer-toggle]');
    this.drawer = document.querySelector(options.drawerSelector || '#mobile-nav');
    this.backdrop = document.querySelector(options.backdropSelector || '[data-drawer-backdrop]');
    this.closeBtn = document.querySelector(options.closeBtnSelector || '[data-drawer-close]');
    this.scrollThreshold = options.scrollThreshold ?? 20;

    this.init();
  }

  private init(): void {
    this.bindScroll();
    this.bindDrawer();
  }

  private bindScroll(): void {
    if (!this.header) return;

    let ticking = false;
    const updateHeader = () => {
      if (!this.header) return;
      const isScrolled = window.scrollY > this.scrollThreshold;
      this.header.classList.toggle('is-scrolled', isScrolled);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );

    // Initial check on page load
    updateHeader();
  }

  private bindDrawer(): void {
    if (!this.drawer || !this.toggleBtn) return;

    this.toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleDrawer();
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeDrawer();
      });
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Keyboard handlers: Escape to close and Tab key focus trap
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeDrawer();
        return;
      }

      if (e.key === 'Tab') {
        this.trapFocus(e);
      }
    });

    // Close drawer when clicking a mobile nav link (for anchor navigation)
    const mobileLinks = this.drawer.querySelectorAll<HTMLAnchorElement>('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        this.closeDrawer();
      });
    });
  }

  public toggleDrawer(): void {
    if (this.isOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  public openDrawer(): void {
    if (this.isOpen || !this.drawer || !this.toggleBtn) return;

    this.previouslyFocusedElement = document.activeElement as HTMLElement;
    this.isOpen = true;

    // Toggle ARIA attributes
    this.toggleBtn.setAttribute('aria-expanded', 'true');
    this.drawer.setAttribute('aria-hidden', 'false');

    // Add active classes
    this.drawer.classList.add('is-open');
    if (this.backdrop) {
      this.backdrop.classList.add('is-open');
    }

    // Lock body scroll
    this.originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus inside drawer to close button or first link
    const firstFocusable = this.getFocusableElements()[0];
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  public closeDrawer(): void {
    if (!this.isOpen || !this.drawer || !this.toggleBtn) return;

    this.isOpen = false;

    // Toggle ARIA attributes
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this.drawer.setAttribute('aria-hidden', 'true');

    // Remove active classes
    this.drawer.classList.remove('is-open');
    if (this.backdrop) {
      this.backdrop.classList.remove('is-open');
    }

    // Restore body scroll
    document.body.style.overflow = this.originalBodyOverflow;

    // Restore focus to the trigger button
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    } else {
      this.toggleBtn.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.drawer) return [];
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(this.drawer.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
    );
  }

  private trapFocus(e: KeyboardEvent): void {
    const focusables = this.getFocusableElements();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (!first || !last) return;

    if (e.shiftKey) {
      // Shift + Tab: if on first element, wrap to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

export function initNavigation(): NavigationController {
  return new NavigationController();
}

