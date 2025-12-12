import { test, expect, Route,BrowserContext,Page  } from '@playwright/test';
import { login } from './login';

const FRONTEND_URL = 'http://localhost:5173';
const EVENT_URL = `${FRONTEND_URL}/event/2`;
const API_BASE = 'http://localhost:3000';

test.setTimeout(120_000);

 
function pickTargetPage(ctx: BrowserContext, primary: Page, popup: Page | null): Page {
  if (popup && !popup.isClosed()) return popup;

  if (!primary.isClosed()) return primary;

  const urlRegex = /\/(myTickets|my-tickets)(\/)?$/i;
  const alive = ctx.pages().filter(p => !p.isClosed());
  const preferred = alive.find(p => urlRegex.test(p.url()));
  if (preferred) return preferred;

  if (alive.length > 0) return alive[alive.length - 1];

  throw new Error('No hay pestañas abiertas para continuar.');
}
test('🎟️ Compra mixta: enumerado + no enumerado y pago con Stripe', async ({ page }) => {
  await login(page);

   
  await page.goto(EVENT_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 });

  const openSeatBtn = page
    .getByRole('button', { name: /seleccionar asientos/i })
    .or(page.locator('button:has-text("Seleccionar Asientos")'))
    .first();
  await openSeatBtn.click();

  const modal = page
    .locator('[data-testid="seat-modal"], [class*="SeatModal"], [class*="modalOverlay"], div[role="dialog"]')
    .first();
  await expect(modal).toBeVisible({ timeout: 15000 });

  const availableSeats = modal.locator('[data-testid^="seat-available-"]');
  await expect(
    availableSeats.first(),
    'No se cargaron asientos disponibles del sector'
  ).toBeVisible({ timeout: 15000 });

  await availableSeats.first().click();

  await modal.getByText(/Asientos seleccionados:\s*1/i).waitFor({ timeout: 3000 }).catch(() => {});

  const confirmAdd = modal
    .getByTestId('add-to-cart')
    .or(modal.locator('button:has-text("Agregar al carrito")'))
    .first();

  await confirmAdd.scrollIntoViewIfNeeded().catch(() => {});
  await expect(confirmAdd).toBeEnabled({ timeout: 5000 });
  await confirmAdd.click({ force: true });

  const toCart  = page.waitForURL('**/cart',  { timeout: 8000 }).catch(() => null);
  const toLogin = page.waitForURL('**/login', { timeout: 8000 }).catch(() => null);
  const landed  = await Promise.race([toCart, toLogin]);

  if (landed === null) {
    const successToast = page.getByText(/has agregado|agregado .* entrada/i);
    const toastShown   = await successToast.count().then(c => c > 0).catch(() => false);

    if (!toastShown && /\/event\ 
      const pageAdd = page
        .getByTestId('page-add-to-cart')
        .or(page.locator('button:has-text("Agregar al Carrito")'))
        .first();
      if (await pageAdd.count()) {
        await pageAdd.click({ force: true }).catch(() => {});
      }
    }

    if (!/\/cart\b/.test(page.url())) {
      await page.goto(`${FRONTEND_URL}/cart`, { waitUntil: 'domcontentloaded' }).catch(() => {});
    }
  }

  if (/\/login\b/i.test(page.url())) {
    await login(page);
    await page.goto(`${FRONTEND_URL}/cart`, { waitUntil: 'domcontentloaded' });
  }



   
  await page.goto(EVENT_URL, { waitUntil: 'domcontentloaded' });

  const generalQty = page.locator('#general-quantity').first();
  if (await generalQty.count()) {
    await generalQty.selectOption('1');

    const addGeneral = page
      .getByTestId('page-add-to-cart')
      .or(page.getByRole('button', { name: /^agregar al carrito$/i }))
      .or(page.locator('button:has-text("Agregar al Carrito")'))
      .first();

    await addGeneral.click();
  } else {
    const cards = page.locator('[id^="sector-card-"]');

    const nonEnumStrict = cards
      .filter({ has: page.locator('select[id^="sector-"]') })
      .filter({ hasNot: page.locator('button:has-text("Seleccionar Asientos")') })
      .first();

    const hasStrict = await nonEnumStrict.count();
    const nonEnumCard = hasStrict
      ? nonEnumStrict
      : cards.filter({ has: page.locator('select[id^="sector-"]') }).first();

    await nonEnumCard.scrollIntoViewIfNeeded();
    await expect(nonEnumCard, 'No encontré un sector no enumerado').toBeVisible({ timeout: 15000 });

    const qtySelect = nonEnumCard.locator('select[id^="sector-"]');
    await expect(qtySelect).toHaveCount(1);
    await qtySelect.selectOption('1');

    const addGlobal = page
      .getByTestId('page-add-to-cart')
      .or(page.getByRole('button', { name: /^agregar al carrito$/i }))
      .or(page.locator('button:has-text("Agregar al Carrito")'))
      .first();

    await addGlobal.click();
  }

  const toCart2  = page.waitForURL('**/cart',  { timeout: 20000 }).catch(() => null);
  const toLogin2 = page.waitForURL('**/login', { timeout: 20000 }).catch(() => null);
  const hit2 = await Promise.race([toCart2, toLogin2]);

  if (hit2 === null || /\/login\b/i.test(page.url())) {
    await login(page);
    await page.goto(`${FRONTEND_URL}/cart`, { waitUntil: 'domcontentloaded' });
  }

  await page.unroute(`${API_BASE}/api/mp/checkout`).catch(() => {});
  await page.unroute(`${API_BASE}/api/stripe/checkout`).catch(() => {});

  const payBtn = page.getByRole('button', { name: /proceder al pago/i }).first();
  await payBtn.click();
  await page.waitForURL('**/pay', { timeout: 20000 });

  const stripeBtn = page.getByRole('button', { name: /^pagar con stripe(?:\s*\(requiere login\))?$/i });
  await expect(stripeBtn).toBeVisible({ timeout: 15000 });
  await expect(stripeBtn).toBeEnabled({ timeout: 15000 });

  await Promise.all([
    page.waitForNavigation({ url: /checkout\.stripe\.com/, timeout: 45000 }),
    stripeBtn.click(),
  ]);

  await page.waitForLoadState('domcontentloaded');

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
      const emailTop = page.locator('input[type="email"]');
      if (await emailTop.count()) {
        if (!(await emailTop.first().inputValue())) {
          await emailTop.first().fill(`juan${Date.now()}@example.com`);
        } else {
          await emailTop.first().focus().catch(() => {});
          await emailTop.first().press('Tab').catch(() => {});
        }
      }

      const direct = await queryInContext(page, selectors);
      if (direct) return { frame: null, locator: direct };

      const origin = page.frame({ name: 'stripe-origin-frame' });
      if (origin) {
        const inOrigin = await queryInContext(origin, selectors);
        if (inOrigin) return { frame: origin, locator: inOrigin };

        for (const child of origin.childFrames()) {
          const inChild = await queryInContext(child, selectors);
          if (inChild) return { frame: child, locator: inChild };
        }
      }

      for (const fr of page.frames()) {
        const inAny = await queryInContext(fr, selectors);
        if (inAny) return { frame: fr, locator: inAny };
      }

      await page.waitForTimeout(250);
    }

    console.log('Frames:', page.frames().map(f => ({ url: f.url(), name: f.name() })));
    throw new Error('Stripe: no pude localizar uno de los campos de tarjeta.');
  }

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

  const { locator: numberInput } = await findStripeField(page, numberSelectors);
  const { locator: expInput }    = await findStripeField(page, expSelectors);
  const { locator: cvcInput }    = await findStripeField(page, cvcSelectors);

  await numberInput.fill('4000000320000021');   
  await expInput.fill('12 / 29');               
  await cvcInput.fill('123');

  const nameCandidates = [
    page.locator('input[name="name"]'),
    page.getByPlaceholder(/cardholder|nombre|name on card/i),
  ];
  for (const cand of nameCandidates) {
    if (await cand.count()) { await cand.first().fill('Juan Armando Esteban Quito'); break; }
  }

  const countryCandidates = [
    page.locator('select[name="country"]'),
    page.locator('select[name="billingDetails[address][country]"]'),
    page.locator('select[name*="country" i]'),
  ];
  for (const cand of countryCandidates) {
    if (await cand.count()) { await cand.first().selectOption('AR').catch(() => {}); break; }
  }


   
  const payNowButton = page.getByRole('button', { name: /pagar|pay|confirmar pago|pagar ahora/i }).first();
  await expect(payNowButton).toBeEnabled({ timeout: 30000 });
  await payNowButton.click();

  const threeDSFrame = page.frameLocator('iframe[name*="challenge"], iframe[title*="challenge" i]');
  if (await threeDSFrame.locator('button, input[type="submit"]').count()) {
    const approve = threeDSFrame.getByRole('button', { name: /complete authentication|authorize|continuar|aceptar|submit/i }).first();
    if (await approve.count()) await approve.click({ trial: true }).catch(() => {});
  }

  const processingUrlRe = /\/pay\/processing\b/i;
  const successUrlRe    = /\/pay\/success\b/i;

  const hitAfterPay = await Promise.race([
    page.waitForURL(processingUrlRe, { timeout: 60_000 }).then(() => 'processing').catch(() => null),
    page.waitForURL(successUrlRe,    { timeout: 60_000 }).then(() => 'success').catch(() => null),
  ]);

  if (hitAfterPay === 'processing') {
    await page.waitForURL(successUrlRe, { timeout: 60_000 });
  }


  await expect(
    page.getByRole('heading', { name: /pago exitoso|gracias|éxito/i })
  ).toBeVisible({ timeout: 20000 });

   
  const goMyTickets = page
    .getByRole('button', { name: /ver mis tickets/i })
    .or(page.getByRole('link', { name: /ver mis tickets/i }))
    .or(page.locator('button:has-text("Ver mis tickets"), a:has-text("Ver mis tickets")'))
    .first();

  await goMyTickets.scrollIntoViewIfNeeded().catch(() => {});
  await expect(goMyTickets).toBeVisible({ timeout: 15_000 });
  await expect(goMyTickets).toBeEnabled({ timeout: 15_000 }).catch(() => {});

  const ctx = page.context();
  const urlRegex = /\/(myTickets|my-tickets)(\/)?$/i;

  const [maybePopup] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 3_000 }).catch(() => null),
    page.waitForURL(urlRegex, { timeout: 3_000 }).catch(() => null),
    goMyTickets.click({ force: true }),
  ]);

  let targetPage: Page = pickTargetPage(ctx, page, maybePopup);

  if (!urlRegex.test(targetPage.url())) {
    await targetPage.goto(`${FRONTEND_URL}/myTickets`).catch(() =>
      targetPage.goto(`${FRONTEND_URL}/my-tickets`).catch(() => {})
    );
  }

  await expect(
    targetPage.getByRole('heading', { name: /mis entradas|mis tickets/i })
  ).toBeVisible({ timeout: 20_000 });


});
