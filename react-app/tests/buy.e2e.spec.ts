import { test, expect, Route } from '@playwright/test';
import { login } from './login';

const FRONTEND_URL = 'http://localhost:5173';
const EVENT_URL = `${FRONTEND_URL}/event/1`;
const API_BASE = 'http://localhost:3000';

test.setTimeout(120_000);

test('🎟️ Compra mixta: enumerado + no enumerado y pago con Stripe', async ({ page }) => {
  // --- Login ---
  await login(page);

  // --- Ir al evento ---
  await page.goto(EVENT_URL, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 });
  console.log('🎭 Entró al evento correctamente');

  // ========== A) ENTRADA ENUMERADA ==========
  // Botón "Seleccionar Asientos"
  const openSeatBtn = page
    .getByRole('button', { name: /seleccionar asientos/i })
    .or(page.locator('button:has-text("Seleccionar Asientos")'))
    .or(page.locator('button:has-text("Seleccionar asiento")'))
    .first();

  await openSeatBtn.waitFor({ state: 'visible', timeout: 15000 });
  await openSeatBtn.scrollIntoViewIfNeeded();
  await openSeatBtn.click({ force: true });
  console.log('🪑 Botón "Seleccionar Asientos" clickeado');

  // Modal enumerado
  const modalOverlay = page.locator(
    '[class*="modalOverlay"], [class*="SeatModal"], [class*="seatModal"], div[role="dialog"]'
  );
  await expect(modalOverlay.first()).toBeVisible({ timeout: 20000 });
  console.log('📋 Modal de asientos visible');

  // Asiento libre (tu SeatSelector pone data-testid="seat-available-<id>")
  const seat = modalOverlay
    .locator(
      '[data-testid^="seat-available-"], .seat.available, .SeatSelector_seat__available, .seat:not(.reserved):not(.occupied)'
    )
    .first();
  await seat.waitFor({ state: 'visible', timeout: 15000 });
  await seat.scrollIntoViewIfNeeded();
  await seat.click({ force: true });
  console.log('💺 Asiento disponible clickeado');

  // Footer del modal → "Agregar al carrito"
  const addFromModal = modalOverlay
    .locator('[class*="modalFooter"], footer, [data-testid*="modal-footer"], div:has(button)')
    .locator('button:enabled')
    .filter({ hasText: /agregar al carrito/i })
    .first();
  await addFromModal.waitFor({ state: 'visible', timeout: 15000 });
  await addFromModal.scrollIntoViewIfNeeded();
  await addFromModal.click({ force: true });
  console.log('✅ Agregado al carrito desde el modal');

  // Carrito
  await page.waitForURL('**/cart', { timeout: 20000 });
  await expect(page.getByRole('heading', { name: /carrito|carrito de compras|tu carrito/i }))
    .toBeVisible({ timeout: 10000 });
  console.log('🧾 Carrito visible tras enumerado');

  // ========== B) VOLVER Y AGREGAR NO ENUMERADA ==========
  await page.goto(EVENT_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 });
  console.log('↩️ Volvió al evento para comprar no enumerada');

  // Asegurar que se renderizaron las cards de sector
  // (SectorList usa styles.sectorCard => [class*="sectorCard"])
  await page.locator('[class*="sectorCard"]').first().waitFor({ state: 'visible', timeout: 15000 });

  // Tomamos específicamente la card de "Popular" o "Campo" y subimos al contenedor de la card
  const nonEnumCard = page
    .getByRole('heading', { name: /popular|campo/i })
    .first()
    .locator('xpath=ancestor::*[self::div or self::section][contains(@class,"sectorCard") or contains(@id,"sector-card-")][1]');

  await nonEnumCard.waitFor({ state: 'visible', timeout: 15000 });

  // Dentro de esa card, el <select id="sector-<id>"> es único
  const qtySelect = nonEnumCard.locator('select[id^="sector-"]');
  await expect(qtySelect).toHaveCount(1, { timeout: 5000 });
  await qtySelect.focus();
  await qtySelect.selectOption({ value: '1' }).catch(async () => {
    await qtySelect.selectOption('1');
  });
  console.log('➕ Seleccionó 1 entrada no enumerada (Popular/Campo)');

  // Botón global "Agregar al Carrito" (está fuera del modal, al final del detalle)
  const addGlobal = page
    .getByRole('button', { name: /^agregar al carrito$/i })
    .or(page.locator('button:has-text("Agregar al Carrito")'))
    .first();
  await addGlobal.waitFor({ state: 'visible', timeout: 15000 });
  await addGlobal.scrollIntoViewIfNeeded();
  await addGlobal.click({ force: true });

  // Carrito nuevamente
  await page.waitForURL('**/cart', { timeout: 20000 });
  await expect(page.getByRole('heading', { name: /carrito|carrito de compras|tu carrito/i }))
    .toBeVisible({ timeout: 10000 });
  console.log('🛒 Carrito visible tras no enumerada');

  // ========== C) CHECKOUT STRIPE ==========
  // Mockear Stripe Checkout ANTES de continuar
  await page.route(`${API_BASE}/api/stripe/checkout`, async (route: Route) => {
    console.log('🧩 Interceptado /api/stripe/checkout → mock success');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: `${FRONTEND_URL}/pay/success` }),
    });
  });

  // Ir a /pay
  const payBtn = page
    .getByRole('button', { name: /proceder al pago/i })
    .or(page.locator('button:has-text("Proceder al pago")'))
    .first();
  await payBtn.waitFor({ state: 'visible', timeout: 15000 });
  await payBtn.click();
  console.log('💳 Click en "Proceder al pago"');

  await page.waitForURL('**/pay', { timeout: 20000 });
  await expect(page.getByRole('heading', { name: /finalizar compra|pago|checkout/i }))
    .toBeVisible({ timeout: 10000 });
  console.log('💰 Página de pago visible');

  // Click en "Pagar con Stripe" (tu Pay.tsx redirige con window.location.href = data.url)
  const stripeBtn = page
    .getByRole('button', { name: /pagar con stripe/i })
    .or(page.getByRole('button', { name: /stripe|pagar|pago/i }))
    .first();
  await stripeBtn.waitFor({ state: 'visible', timeout: 15000 });
  await stripeBtn.click();
  console.log('💸 Pago con Stripe disparado (mock)');

  // Éxito
  await page.waitForURL('**/pay/success', { timeout: 25000 });
  await expect(page.getByRole('heading', { name: /pago exitoso|gracias|éxito/i }))
    .toBeVisible({ timeout: 10000 });
  console.log('🎉 Compra completada: éxito en /pay/success');
});
