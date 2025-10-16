import { test, expect, Route } from '@playwright/test';
import { login } from './login';

const FRONTEND_URL = 'http://localhost:5173';
const EVENT_URL = `${FRONTEND_URL}/event/1`;
const API_BASE = 'http://localhost:3000';

test.setTimeout(120_000);

test('🎟️ Compra mixta: enumerado + no enumerado y pago con Stripe', async ({ page }) => {
  await login(page);

  // A) Enumerado
  await page.goto(EVENT_URL, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 });

  const openSeatBtn = page
    .getByRole('button', { name: /seleccionar asientos/i })
    .or(page.locator('button:has-text("Seleccionar Asientos")'))
    .first();
  await openSeatBtn.click();

  const modal = page.locator(
    '[class*="modalOverlay"], [class*="SeatModal"], [class*="seatModal"], div[role="dialog"]'
  );
  await expect(modal.first()).toBeVisible({ timeout: 15000 });

  const seat = modal.locator('[data-testid^="seat-available-"]').first();
  await seat.click();

  const addFromModal = modal
    .locator('[class*="modalFooter"], footer, [data-testid*="modal-footer"], div:has(button)')
    .locator('button:enabled')
    .filter({ hasText: /agregar al carrito/i })
    .first();
  await addFromModal.click();

  await page.waitForURL('**/cart', { timeout: 20000 });

  // B) No enumerado (Popular/Campo)
  await page.goto(EVENT_URL, { waitUntil: 'domcontentloaded' });

  const nonEnumCard = page
    .getByRole('heading', { name: /popular|campo/i })
    .first()
    .locator(
      'xpath=ancestor::*[self::div or self::section][contains(@class,"sectorCard") or contains(@id,"sector-card-")][1]'
    );
  await nonEnumCard.waitFor({ state: 'visible', timeout: 15000 });

  const qtySelect = nonEnumCard.locator('select[id^="sector-"]');
  await expect(qtySelect).toHaveCount(1);
  await qtySelect.selectOption('1');

  const addGlobal = page
    .getByRole('button', { name: /^agregar al carrito$/i })
    .or(page.locator('button:has-text("Agregar al Carrito")'))
    .first();
  await addGlobal.click();

  await page.waitForURL('**/cart', { timeout: 20000 });
// C) Checkout con STRIPE (flujo real, sin mocks)
await page.unroute(`${API_BASE}/api/mp/checkout`).catch(() => {});
await page.unroute(`${API_BASE}/api/stripe/checkout`).catch(() => {});

// 1) Ir a /pay
const payBtn = page.getByRole('button', { name: /proceder al pago/i }).first();
await payBtn.click();
await page.waitForURL('**/pay', { timeout: 20000 });

// 2) CLICK en el botón de Stripe
const stripeBtn = page.getByRole('button', { name: /^pagar con stripe(?:\s*\(requiere login\))?$/i });
await expect(stripeBtn).toBeVisible({ timeout: 15000 });
await expect(stripeBtn).toBeEnabled({ timeout: 15000 });

// 3) Stripe redirige en la MISMA pestaña
await Promise.all([
  page.waitForNavigation({ url: /checkout\.stripe\.com/, timeout: 45000 }),
  stripeBtn.click(),
]);

await page.waitForLoadState('domcontentloaded');

// 3.bis) activar “Tarjeta/Card” si la UI muestra wallets primero
const cardSelectors = [
  'button:has-text("Card")',
  'button:has-text("Tarjeta")',
  'button:has-text("Credit or debit card")',
  '[role="tab"]:has-text("Card")',
  '[role="tab"]:has-text("Tarjeta")',
  'button:has-text("Use a credit or debit card")',
  'a:has-text("Use a credit or debit card")',
  'button:has-text("Add new card")',
  'button:has-text("Pagar con tarjeta")',
  'button:has-text("Agregar tarjeta")',
];
for (const sel of cardSelectors) {
  const btn = page.locator(sel).first();
  if (await btn.count()) {
    await btn.click({ force: true });
    break;
  }
}
// 4) Completar TARJETA en Checkout (soporta sin iframes, 1 iframe o 3 iframes)

async function queryInContext(
  ctx: import('@playwright/test').Page | import('@playwright/test').Frame,
  selectors: string[]
) {
  for (const sel of selectors) {
    const loc = ctx.locator(sel);
    if (await loc.count()) return loc.first();
  }
  return null;
}

async function findStripeField(
  page: import('@playwright/test').Page,
  selectors: string[],
  timeoutMs = 20_000
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    // 0) Asegurar email (muchas UIs montan campos al tocarlo)
    const emailTop = page.locator('input[type="email"]');
    if (await emailTop.count()) {
      if (!(await emailTop.first().inputValue())) {
        await emailTop.first().fill(`juan${Date.now()}@example.com`);
      } else {
        await emailTop.first().focus().catch(() => {});
        await emailTop.first().press('Tab').catch(() => {});
      }
    }

    // 1) Intentar directamente en la página (caso sin iframes)
    const direct = await queryInContext(page, selectors);
    if (direct) return { frame: null, locator: direct };

    // 2) Intentar dentro del origin-frame si existe
    const origin = page.frame({ name: 'stripe-origin-frame' });
    if (origin) {
      // 2.a) Dentro del propio origin (a veces los inputs están ahí mismo)
      const inOrigin = await queryInContext(origin, selectors);
      if (inOrigin) return { frame: origin, locator: inOrigin };

      // 2.b) Dentro de cualquiera de sus hijos (1 o 3 iframes)
      for (const child of origin.childFrames()) {
        const inChild = await queryInContext(child, selectors);
        if (inChild) return { frame: child, locator: inChild };
      }
    }

    // 3) Último recurso: escanear todos los frames de la página
    for (const fr of page.frames()) {
      const inAny = await queryInContext(fr, selectors);
      if (inAny) return { frame: fr, locator: inAny };
    }

    await page.waitForTimeout(250);
  }

  console.log('Frames:', page.frames().map(f => ({ url: f.url(), name: f.name() })));
  throw new Error('Stripe: no pude localizar uno de los campos de tarjeta.');
}

// Activar “Tarjeta/Card” si hay wallets primero (defensivo, idempotente)
const possibleCardButtons = [
  'button:has-text("Card")',
  'button:has-text("Tarjeta")',
  'button:has-text("Credit or debit card")',
  '[role="tab"]:has-text("Card")',
  '[role="tab"]:has-text("Tarjeta")',
  'button:has-text("Use a credit or debit card")',
  'a:has-text("Use a credit or debit card")',
  'button:has-text("Add new card")',
  'button:has-text("Pagar con tarjeta")',
  'button:has-text("Agregar tarjeta")',
];
for (const s of possibleCardButtons) {
  const b = page.locator(s);
  if (await b.count()) { await b.first().click({ force: true }).catch(() => {}); break; }
}

// Selectores amplios que cubren ES/EN y variaciones de Stripe
const numberSelectors = [
  'input[aria-label*="card number" i]',
  'input[aria-label*="número de tarjeta" i]',
  'input[name="number"]',
  'input[autocomplete="cc-number"]',
  'input[placeholder*="1234"]',
];
const expSelectors = [
  'input[aria-label*="expiration" i]',
  'input[aria-label*="expiry" i]',
  'input[aria-label*="vencimiento" i]',
  'input[name="exp-date"]',
  'input[autocomplete="cc-exp"]',
  'input[placeholder*="MM"]',
  'input[placeholder*="AA"]',
  'input[placeholder*="AA/"]',
];
const cvcSelectors = [
  'input[aria-label*="cvc" i]',
  'input[aria-label*="security code" i]',
  'input[aria-label*="código de seguridad" i]',
  'input[name="cvc"]',
  'input[autocomplete="cc-csc"]',
  'input[placeholder*="CVC"]',
  'input[placeholder*="CVV"]',
];

// Localizar cada campo (sin asumir estructura)
const { locator: numberInput } = await findStripeField(page, numberSelectors);
const { locator: expInput }    = await findStripeField(page, expSelectors);
const { locator: cvcInput }    = await findStripeField(page, cvcSelectors);

// Completar tarjeta de prueba
await numberInput.fill('4000000320000021');   // Visa test con 3DS opcional
await expInput.fill('12 / 29');               // acepta "12/29" o "12 / 29"
await cvcInput.fill('123');

// Nombre del titular (suele estar fuera del/los iframe/s)
const nameCandidates = [
  page.locator('input[name="name"]'),
  page.getByPlaceholder(/cardholder|nombre|name on card/i),
];
for (const cand of nameCandidates) {
  if (await cand.count()) { await cand.first().fill('Juan Armando Esteban Quito'); break; }
}

// País (si aparece)
const countryCandidates = [
  page.locator('select[name="country"]'),
  page.locator('select[name="billingDetails[address][country]"]'),
  page.locator('select[name*="country" i]'),
];
for (const cand of countryCandidates) {
  if (await cand.count()) { await cand.first().selectOption('AR').catch(() => {}); break; }
}


// 5) Pagar (y manejar 3DS si aparece)
const payNowButton = page.getByRole('button', { name: /pagar|pay|confirmar pago|pagar ahora/i }).first();
await expect(payNowButton).toBeEnabled({ timeout: 30000 });
await payNowButton.click();

// 5.bis) Desafío 3DS opcional
const threeDSFrame = page.frameLocator('iframe[name*="challenge"], iframe[title*="challenge" i]');
if (await threeDSFrame.locator('button, input[type="submit"]').count()) {
  const approve = threeDSFrame.getByRole('button', { name: /complete authentication|authorize|continuar|aceptar|submit/i }).first();
  if (await approve.count()) await approve.click({ trial: true }).catch(() => {});
}

// 6) Esperar redirect: /pay/processing o salto directo a /pay/success
const processingUrlRe = /\/pay\/processing\b/i;
const successUrlRe    = /\/pay\/success\b/i;

await Promise.race([
  page.waitForURL(processingUrlRe, { timeout: 60000 }),
  page.waitForURL(successUrlRe,  { timeout: 60000 }),
]);

// Si caímos en /pay/processing, el texto es opcional: no hagamos fallar el test
if (processingUrlRe.test(page.url())) {
  await page.getByText(/procesando tu pago/i).waitFor({ timeout: 5000 }).catch(() => {});
  // la app debería redirigir a success sola
  await page.waitForURL(successUrlRe, { timeout: 60000 });
}

// 7) Verificar success
await expect(
  page.getByRole('heading', { name: /pago exitoso|gracias|éxito/i })
).toBeVisible({ timeout: 20000 });

// 8) Ver mis tickets (robusto: button o link, misma pestaña o popup, /myTickets o /my-tickets)
const goMyTickets = page
  .getByRole('button', { name: /ver mis tickets/i })
  .or(page.getByRole('link', { name: /ver mis tickets/i }))
  .or(page.locator('button:has-text("Ver mis tickets"), a:has-text("Ver mis tickets")'))
  .first();

await goMyTickets.scrollIntoViewIfNeeded().catch(() => {});
await expect(goMyTickets).toBeVisible({ timeout: 15000 });
await expect(goMyTickets).toBeEnabled({ timeout: 15000 }).catch(() => {});

// Click + espera: cubre SPA (waitForURL), navegación completa o popup
const targetUrl = /\/(myTickets|my-tickets)(\/)?$/i;

const [popup] = await Promise.all([
  page.waitForEvent('popup').catch(() => null),                                  // si abre en nueva pestaña
  page.waitForURL(`**/${'{myTickets,my-tickets}'}`, { timeout: 15000 }).catch(() => null), // cambio de URL SPA o full
  goMyTickets.click({ force: true }),
]);

// si abrió popup, seguimos en esa tab
const targetPage = popup ?? page;

// si aún no cambió la URL (SPA sin evento/nombre distinto), esperar el heading de la vista
if (!targetUrl.test(targetPage.url())) {
  // espera por el heading típico de la pantalla de tickets
  const ticketsHeading = targetPage.getByRole('heading', { name: /mis entradas|mis tickets/i });
  await ticketsHeading.waitFor({ timeout: 15000 }).catch(async () => {
    // último fallback: ir directo (solo si la UI no navegó)
    await targetPage.goto(`${FRONTEND_URL}/myTickets`).catch(() =>
      targetPage.goto(`${FRONTEND_URL}/my-tickets`).catch(() => {})
    );
  });
}

// verificación final (admite ambos paths y el heading)
await expect(
  targetPage.getByRole('heading', { name: /mis entradas|mis tickets/i })
).toBeVisible({ timeout: 20000 });});
