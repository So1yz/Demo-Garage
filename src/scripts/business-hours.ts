/**
 * Autora Automotive — Dynamic Business Hours Controller
 * Evaluates current time in the Europe/Amsterdam timezone
 * and updates real-time status indicators across the site.
 */

export interface GarageSchedule {
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
}

const WEEKDAY_SCHEDULE: GarageSchedule = {
  openHour: 8,
  openMinute: 0,
  closeHour: 17,
  closeMinute: 30,
};

export function getGarageStatus(): { isOpen: boolean; statusText: string } {
  try {
    // Determine current date/time in Dutch timezone
    const now = new Date();
    const amsterdamTimeStr = now.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' });
    const localNow = new Date(amsterdamTimeStr);

    const day = localNow.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();
    const openMinutes = WEEKDAY_SCHEDULE.openHour * 60 + WEEKDAY_SCHEDULE.openMinute;
    const closeMinutes = WEEKDAY_SCHEDULE.closeHour * 60 + WEEKDAY_SCHEDULE.closeMinute;

    const isWeekday = day >= 1 && day <= 5;

    if (isWeekday) {
      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        return {
          isOpen: true,
          statusText: 'Nu Geopend (tot 17:30)',
        };
      }
      if (currentMinutes < openMinutes) {
        return {
          isOpen: false,
          statusText: 'Nu Gesloten (opent om 08:00)',
        };
      }
      // After closing on Friday
      if (day === 5) {
        return {
          isOpen: false,
          statusText: 'Nu Gesloten (opent maandag om 08:00)',
        };
      }
      return {
        isOpen: false,
        statusText: 'Nu Gesloten (opent morgen om 08:00)',
      };
    }

    // Weekend (Saturday or Sunday)
    return {
      isOpen: false,
      statusText: 'Nu Gesloten (opent maandag om 08:00)',
    };
  } catch {
    // Safe fallback if timezone calculation encounters an issue
    return {
      isOpen: false,
      statusText: 'Ma–Vr: 08:00 – 17:30',
    };
  }
}

export function initBusinessHours(): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-business-hours-status]');
  if (elements.length === 0) return;

  const { isOpen, statusText } = getGarageStatus();

  elements.forEach((el) => {
    el.textContent = statusText;
    const pill = el.closest('.status-pill');
    if (pill) {
      pill.classList.toggle('is-closed', !isOpen);
    }
  });
}

