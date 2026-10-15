/**
 * Autora Automotive — Main TypeScript Entry Point
 * Phase 2: Navigation, Motion System & Responsive Shell Bootstrap
 */

import { initNavigation } from './navigation.ts';
import { initMotion } from './motion.ts';
import { initBusinessHours } from './business-hours.ts';
import { initFormHandler } from './form-handler.ts';

export function bootstrap(): void {
  if (typeof document === 'undefined') return;

  // 1. Dynamic copyright year update
  const currentYearElements = document.querySelectorAll<HTMLElement>('[data-current-year]');
  const currentYear = new Date().getFullYear().toString();
  currentYearElements.forEach((el) => {
    el.textContent = currentYear;
  });

  // 2. Initialize sticky header & accessible mobile drawer
  initNavigation();

  // 3. Initialize accessible IntersectionObserver motion system
  initMotion();

  // 4. Initialize real-time Dutch business hours indicator
  initBusinessHours();

  // 5. Initialize interactive appointment form & Kenteken formatter
  initFormHandler();

  if (import.meta.env.DEV) {
    console.info('[Autora Automotive] Phase 5: Form handler & Kenteken formatter initialized.');
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
