/**
 * Autora Automotive — Motion Controller
 * Lightweight, accessible IntersectionObserver scroll reveal system.
 * Guarantees content remains visible if JavaScript fails or reduced motion is enabled.
 */

export interface MotionOptions {
  revealSelector?: string;
  threshold?: number;
  rootMargin?: string;
}

export class MotionController {
  private revealElements: NodeListOf<HTMLElement>;
  private observer: IntersectionObserver | null = null;
  private prefersReducedMotion: boolean = false;

  constructor(options: MotionOptions = {}) {
    this.revealSelector = options.revealSelector || '.reveal-on-scroll';
    this.threshold = options.threshold ?? 0.15;
    this.rootMargin = options.rootMargin || '0px 0px -40px 0px';
    this.revealElements = document.querySelectorAll(this.revealSelector);

    this.init();
  }

  private revealSelector: string;
  private threshold: number;
  private rootMargin: string;

  private init(): void {
    // 1. Check user preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = motionQuery.matches;

    // Listen for preference changes live
    motionQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion) {
        this.revealAllInstantly();
      }
    });

    // 2. If user prefers reduced motion or IntersectionObserver is unsupported, reveal all and exit
    if (this.prefersReducedMotion || !('IntersectionObserver' in window)) {
      this.revealAllInstantly();
      return;
    }

    // 3. Progressive enhancement: mark document root as supporting motion
    document.documentElement.classList.add('has-motion');

    // 4. Setup IntersectionObserver
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: this.threshold,
        rootMargin: this.rootMargin,
      }
    );

    // Observe each target element
    this.revealElements.forEach((el) => {
      this.observer?.observe(el);
    });
  }

  private revealAllInstantly(): void {
    document.documentElement.classList.remove('has-motion');
    this.revealElements.forEach((el) => {
      el.classList.add('is-revealed');
      this.observer?.unobserve(el);
    });
  }

  public refresh(): void {
    if (this.prefersReducedMotion || !this.observer) return;

    const currentElements = document.querySelectorAll<HTMLElement>(this.revealSelector);
    currentElements.forEach((el) => {
      if (!el.classList.contains('is-revealed')) {
        this.observer?.observe(el);
      }
    });
  }
}

export function initMotion(): MotionController {
  return new MotionController();
}

