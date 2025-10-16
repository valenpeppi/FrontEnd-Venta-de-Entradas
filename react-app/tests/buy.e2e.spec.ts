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

  // C) Checkout con STRIPE (NO MP)
  // 1) Guardia: si por error se toca MP, marcamos la variable y fallamos
  let mpHit = false;
  await page.route(`${API_BASE}/api/mp/checkout`, async (route) => {
    mpHit = true; // si se invoca, algo clickeó MP
    await route.abort();
  });

  // 2) Mock de Stripe ANTES del click
  await page.route(`${API_BASE}/api/stripe/checkout`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: `${FRONTEND_URL}/pay/success` }),
    });
  });

  // 3) Ir a /pay
  const payBtn = page.getByRole('button', { name: /proceder al pago/i }).first();
  await payBtn.click();
  await page.waitForURL('**/pay', { timeout: 20000 });

  // 4) CLICK EXACTO en STRIPE (no regex amplias)
  const stripeBtn = page.getByRole('button', {
    name: /^pagar con stripe(?:\s*\(requiere login\))?$/i,
  });
  await expect(stripeBtn).toBeVisible({ timeout: 15000 });
  await expect(stripeBtn).toBeEnabled({ timeout: 15000 });
  await stripeBtn.click();

  // 5) Validar que NO tocamos Mercado Pago
  expect(mpHit, 'Se disparó el endpoint de Mercado Pago: se tocó el botón incorrecto').toBeFalsy();

  // 6) Éxito
  await page.waitForURL('**/pay/success', { timeout: 25000 });
  await expect(page.getByRole('heading', { name: /pago exitoso|gracias|éxito/i }))
    .toBeVisible({ timeout: 10000 });
});
