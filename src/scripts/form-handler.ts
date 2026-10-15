/**
 * Autora Automotive — Interactive Contact & Appointment Form Handler
 * Phase 5: Client-Side Validation, Dutch Kenteken Formatter, Honeypot Anti-Spam & Web3Forms
 */

export interface FormSubmissionData {
  name: string;
  phone: string;
  email: string;
  kenteken: string;
  serviceType: string;
  datePref?: string;
  timePref?: string;
  loanerCar?: boolean;
  waitWorkshop?: boolean;
  message?: string;
  privacyConsent: boolean;
}

/**
 * Dutch RDW Vehicle License Plate (Sidecodes 1 to 14) Patterns
 */
const DUTCH_SIDECODES: RegExp[] = [
  /^([A-Z]{2})(\d{2})(\d{2})$/, // 1: XX-99-99
  /^(\d{2})(\d{2})([A-Z]{2})$/, // 2: 99-99-XX
  /^(\d{2})([A-Z]{2})(\d{2})$/, // 3: 99-XX-99
  /^([A-Z]{2})(\d{2})([A-Z]{2})$/, // 4: XX-99-XX
  /^([A-Z]{2})([A-Z]{2})(\d{2})$/, // 5: XX-XX-99
  /^(\d{2})([A-Z]{2})([A-Z]{2})$/, // 6: 99-XX-XX
  /^(\d{2})([A-Z]{3})(\d{1})$/, // 7: 99-XXX-9
  /^(\d{1})([A-Z]{3})(\d{2})$/, // 8: 9-XXX-99
  /^([A-Z]{2})(\d{3})([A-Z]{1})$/, // 9: XX-999-X
  /^([A-Z]{1})(\d{3})([A-Z]{2})$/, // 10: X-999-XX
  /^([A-Z]{3})(\d{2})([A-Z]{1})$/, // 11: XXX-99-X
  /^([A-Z]{1})(\d{2})([A-Z]{3})$/, // 12: X-99-XXX
  /^(\d{1})([A-Z]{2})(\d{3})$/, // 13: 9-XX-999
  /^(\d{3})([A-Z]{2})(\d{1})$/, // 14: 999-XX-9
];

/**
 * Clean and format a Dutch license plate string with hyphens
 */
export function formatKenteken(input: string): string {
  const clean = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
  if (!clean) return '';

  // If 6 characters, attempt to match Dutch sidecodes
  if (clean.length === 6) {
    for (const regex of DUTCH_SIDECODES) {
      if (regex.test(clean)) {
        return clean.replace(regex, '$1-$2-$3');
      }
    }
    // Fallback 6-char 2-2-2 grouping
    return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4)}`;
  }

  return clean;
}

/**
 * Validate vehicle license plate format (accepts 4 to 8 alphanumeric characters, including Dutch sidecodes, commercial and custom plates)
 */
export function isValidKenteken(input: string): boolean {
  const clean = input.replace(/[^a-zA-Z0-9]/g, '');
  return clean.length >= 4 && clean.length <= 8;
}

/**
 * Validate standard email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Validate Dutch / international phone format (accepts any valid phone number with 8 to 15 digits)
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Generate a pre-filled mailto URL as progressive fallback
 */
export function generateMailtoFallback(data: FormSubmissionData): string {
  const subject = encodeURIComponent(`Werkplaatsaanvraag [${data.kenteken || 'Onbekend'}] — ${data.name}`);
  const body = encodeURIComponent(
    `Beste Autora Automotive,\n\n` +
    `Hierbij vraag ik een afspraak/offerte aan voor mijn voertuig:\n\n` +
    `• Naam: ${data.name}\n` +
    `• Telefoon: ${data.phone}\n` +
    `• E-mail: ${data.email}\n` +
    `• Kenteken: ${data.kenteken}\n` +
    `• Gewenste Dienst: ${data.serviceType}\n` +
    `• Voorkeursdatum: ${data.datePref || 'In overleg'}\n` +
    `• Dagdeel: ${data.timePref || 'Niet gespecificeerd'}\n` +
    `• Leenauto gewenst: ${data.loanerCar ? 'Ja' : 'Nee'}\n` +
    `• Wachten in werkplaats: ${data.waitWorkshop ? 'Ja' : 'Nee'}\n\n` +
    `Toelichting/klachtomschrijving:\n${data.message || 'Geen toelichting opgegeven.'}\n\n` +
    `Met vriendelijke groet,\n${data.name}`
  );
  return `mailto:info@autora-automotive.nl?subject=${subject}&body=${body}`;
}

/**
 * Initialize Form Handler on the page
 */
export function initFormHandler(): void {
  const form = document.querySelector<HTMLFormElement>('#appointment-form');
  if (!form) return;

  const nameInput = form.querySelector<HTMLInputElement>('#name');
  const phoneInput = form.querySelector<HTMLInputElement>('#phone');
  const emailInput = form.querySelector<HTMLInputElement>('#email');
  const kentekenInput = form.querySelector<HTMLInputElement>('#kenteken');
  const serviceSelect = form.querySelector<HTMLSelectElement>('#service-type');
  const privacyConsent = form.querySelector<HTMLInputElement>('#privacy-consent');

  if (!nameInput || !phoneInput || !emailInput || !kentekenInput || !serviceSelect || !privacyConsent) {
    return;
  }

  const kentekenPreview = document.querySelector<HTMLElement>('#kenteken-preview-text');
  const dateInput = form.querySelector<HTMLInputElement>('#date-pref');
  const timeSelect = form.querySelector<HTMLSelectElement>('#time-pref');
  const loanerCheckbox = form.querySelector<HTMLInputElement>('input[name="loaner-car"]');
  const waitCheckbox = form.querySelector<HTMLInputElement>('input[name="wait-workshop"]');
  const messageInput = form.querySelector<HTMLTextAreaElement>('#message');
  const submitBtn = form.querySelector<HTMLButtonElement>('#submit-btn');
  const botcheckInput = form.querySelector<HTMLInputElement>('#form-botcheck');
  const globalErrorBanner = form.querySelector<HTMLElement>('#form-global-error');
  const successContainer = document.querySelector<HTMLElement>('#form-success-container');
  const formCard = document.querySelector<HTMLElement>('#appointment-form-card');

  // Set minimum date to today for datepicker
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0] ?? '';
    dateInput.min = today;
  }

  // Real-time Kenteken Formatter & Badge Synchronizer
  if (kentekenInput) {
    kentekenInput.addEventListener('input', () => {
      clearFieldError(kentekenInput, 'kenteken-error');
      const val = kentekenInput.value.trim().toUpperCase();
      if (kentekenPreview) {
        kentekenPreview.textContent = val || 'XX-XX-XX';
      }
    });

    kentekenInput.addEventListener('blur', () => {
      const formatted = formatKenteken(kentekenInput.value);
      if (formatted) {
        kentekenInput.value = formatted;
        if (kentekenPreview) {
          kentekenPreview.textContent = formatted;
        }
      }
      if (kentekenInput.value.trim() && !isValidKenteken(kentekenInput.value)) {
        setFieldError(kentekenInput, 'kenteken-error', 'Vul alstublieft een geldig kenteken in (bijv. AB-123-C).');
      } else if (kentekenInput.value.trim()) {
        setFieldValid(kentekenInput, 'kenteken-error');
      }
    });
  }

  // Clear errors on field interaction
  nameInput?.addEventListener('input', () => clearFieldError(nameInput, 'name-error'));
  phoneInput?.addEventListener('input', () => clearFieldError(phoneInput, 'phone-error'));
  emailInput?.addEventListener('input', () => clearFieldError(emailInput, 'email-error'));
  serviceSelect?.addEventListener('change', () => clearFieldError(serviceSelect, 'service-type-error'));
  privacyConsent?.addEventListener('change', () => clearFieldError(privacyConsent, 'privacy-consent-error'));

  // Form Submission
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    if (globalErrorBanner) {
      globalErrorBanner.style.display = 'none';
      globalErrorBanner.innerHTML = '';
    }

    // Anti-Spam Honeypot Check
    if (botcheckInput && botcheckInput.value.trim() !== '') {
      console.warn('[Autora] Bot detected via honeypot.');
      showSuccessView({
        name: 'Bezoeker',
        phone: '',
        email: '',
        kenteken: 'XX-XX-XX',
        serviceType: 'Onderhoud',
        privacyConsent: true,
      });
      return;
    }

    // Validate fields
    let isValid = true;
    let firstInvalidField: HTMLElement | null = null;

    if (!nameInput || nameInput.value.trim().length < 2) {
      setFieldError(nameInput, 'name-error', 'Vul alstublieft uw voor- en achternaam in.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = nameInput;
    } else {
      setFieldValid(nameInput, 'name-error');
    }

    if (!phoneInput || !isValidPhone(phoneInput.value)) {
      setFieldError(phoneInput, 'phone-error', 'Vul een geldig telefoonnummer in (bijv. 06-12345678 of 010-0000000).');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = phoneInput;
    } else {
      setFieldValid(phoneInput, 'phone-error');
    }

    if (!emailInput || !isValidEmail(emailInput.value)) {
      setFieldError(emailInput, 'email-error', 'Vul een geldig e-mailadres in (bijv. uw@email.nl).');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = emailInput;
    } else {
      setFieldValid(emailInput, 'email-error');
    }

    if (!kentekenInput || !isValidKenteken(kentekenInput.value)) {
      setFieldError(kentekenInput, 'kenteken-error', 'Vul alstublieft een geldig kenteken in (bijv. AB-123-C).');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = kentekenInput;
    } else {
      setFieldValid(kentekenInput, 'kenteken-error');
    }

    if (!serviceSelect || !serviceSelect.value) {
      setFieldError(serviceSelect, 'service-type-error', 'Selecteer alstublieft de gewenste dienst of werkzaamheden.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = serviceSelect;
    } else {
      setFieldValid(serviceSelect, 'service-type-error');
    }

    if (!privacyConsent || !privacyConsent.checked) {
      setFieldError(privacyConsent, 'privacy-consent-error', 'U dient akkoord te gaan met de privacyverklaring.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = privacyConsent;
    } else {
      clearFieldError(privacyConsent, 'privacy-consent-error');
    }

    if (!isValid) {
      firstInvalidField?.focus();
      return;
    }

    // Collect submission payload
    const formattedPlate = formatKenteken(kentekenInput.value.trim());
    const formData: FormSubmissionData = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      kenteken: formattedPlate || kentekenInput.value.trim().toUpperCase(),
      serviceType: serviceSelect.value,
      datePref: dateInput?.value || undefined,
      timePref: timeSelect?.value || undefined,
      loanerCar: loanerCheckbox?.checked || false,
      waitWorkshop: waitCheckbox?.checked || false,
      message: messageInput?.value.trim() || undefined,
      privacyConsent: true,
    };

    // Set UI to loading state
    setButtonLoading(submitBtn, true);

    const accessKeyInput = form.querySelector<HTMLInputElement>('#web3forms-access-key');
    const accessKey = accessKeyInput ? accessKeyInput.value.trim() : 'DEMO_AUTORA_AUTOMOTIVE';

    // Real API Submission is ONLY triggered if an actual 36-char Web3Forms UUID key is present
    const isRealApiKey =
      accessKey &&
      accessKey !== 'DEMO_AUTORA_AUTOMOTIVE' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(accessKey);

    try {
      if (!isRealApiKey) {
        // High-fidelity demo mode with realistic server delay
        await new Promise((resolve) => setTimeout(resolve, 600));
        showSuccessView(formData);
      } else {
        // Active Web3Forms API submission
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `Nieuwe Werkplaatsaanvraag [${formData.kenteken}] — ${formData.name}`,
            from_name: 'Autora Automotive Website',
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            kenteken: formData.kenteken,
            service: formData.serviceType,
            date_preference: formData.datePref || 'Niet gespecificeerd',
            time_preference: formData.timePref || 'Niet gespecificeerd',
            loaner_car: formData.loanerCar ? 'Ja' : 'Nee',
            wait_workshop: formData.waitWorkshop ? 'Ja' : 'Nee',
            message: formData.message || 'Geen toelichting',
          }),
        });

        const result = await response.json();
        if (response.ok && result.success) {
          showSuccessView(formData);
        } else {
          throw new Error(result.message || 'Verzending via API mislukt.');
        }
      }
    } catch (err: unknown) {
      console.error('[Autora Form Error]', err);
      const fallbackUrl = generateMailtoFallback(formData);

      if (globalErrorBanner) {
        globalErrorBanner.style.display = 'block';
        globalErrorBanner.innerHTML = `
          <strong>Verzending niet geslaagd</strong>
          <span>Er kon geen verbinding worden gemaakt met de server. Probeer het opnieuw of verstuur uw aanvraag direct via e-mail:</span>
          <div style="margin-top: var(--space-2);">
            <a href="${fallbackUrl}" class="btn btn-secondary" style="font-size: var(--font-size-xs); padding: 0.35rem 0.75rem;">
              Verstuur via E-mailprogramma &rarr;
            </a>
          </div>
        `;
      }
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  function showSuccessView(data: FormSubmissionData): void {
    if (!form || !successContainer) return;

    form.style.display = 'none';
    successContainer.style.display = 'block';

    let formattedDate = 'In telefonisch overleg';
    if (data.datePref) {
      try {
        const d = new Date(data.datePref);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
      } catch {
        formattedDate = data.datePref;
      }
    }

    successContainer.innerHTML = `
      <div class="form-success-icon-wrap" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <span class="badge badge-accent" style="margin-bottom: var(--space-2);">AANVRAAG ONTVANGEN</span>
      <h3 style="font-size: var(--font-size-2xl); color: var(--color-text-primary); margin-bottom: var(--space-2);">
        Hartelijk dank, ${escapeHtml(data.name)}!
      </h3>
      <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.6; margin-bottom: var(--space-4);">
        Uw aanvraag is succesvol geregistreerd in onze werkplaatsplanning.
        Onze chef-werkplaats controleert de beschikbaarheid en onderdeelspecificaties voor kenteken <strong>${escapeHtml(data.kenteken)}</strong>.
      </p>

      <div class="form-success-summary">
        <div class="form-success-summary-item">
          <span style="color: var(--color-text-muted);">Voertuig / Kenteken:</span>
          <strong style="font-family: var(--font-family-mono); color: var(--color-accent);">${escapeHtml(data.kenteken)}</strong>
        </div>
        <div class="form-success-summary-item">
          <span style="color: var(--color-text-muted);">Gewenste Dienst:</span>
          <strong style="color: var(--color-text-primary);">${escapeHtml(data.serviceType)}</strong>
        </div>
        <div class="form-success-summary-item">
          <span style="color: var(--color-text-muted);">Voorkeursdatum:</span>
          <span>${formattedDate} (${escapeHtml(data.timePref || 'Ochtend')})</span>
        </div>
        <div class="form-success-summary-item">
          <span style="color: var(--color-text-muted);">Vervangend Vervoer:</span>
          <span>${data.loanerCar ? 'Leenauto gewenst' : data.waitWorkshop ? 'Wachten in werkplaats' : 'Niet geselecteerd'}</span>
        </div>
      </div>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); margin-bottom: var(--space-6); font-size: var(--font-size-xs); color: #166534;">
        <strong>Onze Reactiebelofte:</strong> Wij nemen tijdens werkdagen binnen 2 uur telefonisch of per e-mail contact met u op voor de definitieve bevestiging.
      </div>

      <button type="button" id="reset-form-btn" class="btn btn-secondary" style="width: 100%;">
        Nieuwe Aanvraag Indienen
      </button>
    `;

    // Smooth scroll to card
    formCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Reset button listener
    const resetBtn = successContainer.querySelector<HTMLButtonElement>('#reset-form-btn');
    resetBtn?.addEventListener('click', () => {
      form.reset();
      if (kentekenPreview) kentekenPreview.textContent = 'XX-XX-XX';
      successContainer.style.display = 'none';
      form.style.display = 'flex';
      formCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function setFieldError(field: HTMLElement | null, errorId: string, message: string): void {
    if (!field) return;
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    field.setAttribute('aria-invalid', 'true');

    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'flex';
    }
  }

  function setFieldValid(field: HTMLElement | null, errorId: string): void {
    if (!field) return;
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    field.removeAttribute('aria-invalid');

    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function clearFieldError(field: HTMLElement | null, errorId: string): void {
    if (!field) return;
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');

    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function setButtonLoading(btn: HTMLButtonElement | null, isLoading: boolean): void {
    if (!btn) return;
    const textSpan = btn.querySelector<HTMLElement>('.btn-text');
    const spinner = btn.querySelector<HTMLElement>('.btn-spinner');

    if (isLoading) {
      btn.disabled = true;
      if (textSpan) textSpan.textContent = 'Aanvraag wordt verzonden...';
      if (spinner) spinner.style.display = 'inline-block';
    } else {
      btn.disabled = false;
      if (textSpan) textSpan.innerHTML = 'Afspraak Aanvragen &rarr;';
      if (spinner) spinner.style.display = 'none';
    }
  }

  function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
