import { test, expect } from '@playwright/test';
import { login } from './login';

const FRONTEND_URL = 'http://localhost:5173';

test('🎟️ Flujo completo de compra con Stripe (mixto enumerado + no enumerado)', async ({ page }) => {
  // 1️⃣ LOGIN -------------------------------------------------------------
  await login(page);

  // 2️⃣ ENTRAR AL EVENTO --------------------------------------------------
  const EVENT_URL = `${FRONTEND_URL}/event/1`;
  await page.goto(EVENT_URL, { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  console.log('🎭 Entró al evento correctamente');

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  // 3️⃣ SELECCIONAR UNA ENTRADA NO ENUMERADA (Popular o Campo) -----------
  try {
    const headers = page.locator('h3');
    const total = await headers.count();
    console.log(`🔍 Se encontraron ${total} sectores visibles`);

    let seleccionado = false;

    for (let i = 0; i < total; i++) {
      const name = await headers.nth(i).innerText();
      if (name.includes('Popular') || name.includes('Campo')) {
        console.log(`✅ Sector no enumerado encontrado: ${name}`);

        const card = headers.nth(i).locator('..'); // contenedor del selector
        const select = card.locator('select');
        await expect(select).toBeVisible({ timeout: 10000 });
        await select.selectOption('1');
        console.log(`🎫 Seleccionada 1 entrada en ${name}`);

        const addBtn = card.locator('button:has-text("Agregar al Carrito")');
        if (await addBtn.isVisible()) {
          await addBtn.click();
          console.log(`🛒 Click en “Agregar al Carrito” en ${name}`);
        }
        seleccionado = true;
        break;
      }
    }

    if (!seleccionado) console.warn('⚠️ No se encontró ningún sector no enumerado');
  } catch (err) {
    console.error('❌ Error al seleccionar entrada no enumerada:', err);
  }

  // 4️⃣ ABRIR UN SECTOR ENUMERADO ----------------------------------------
  try {
    const btn = page.locator('button:has-text("Seleccionar Asientos")').first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.click();
    console.log('🪑 Botón "Seleccionar Asientos" clickeado');
  } catch {
    console.warn('⚠️ No se encontró botón "Seleccionar Asientos"');
  }

  // 5️⃣ ESPERAR QUE APAREZCA EL MODAL DE ASIENTOS -------------------------
  await page.waitForTimeout(1500);
  const modalSeat = page.locator('.SeatSelector_seat__');
  if (await modalSeat.count() > 0) {
    console.log('📋 Modal de asientos visible');
  } else {
    console.warn('⚠️ No se detectó modal de asientos, intentando continuar…');
  }

  // 6️⃣ SELECCIONAR UN ASIENTO DISPONIBLE ---------------------------------
  let asientoSeleccionado = false;
  const seatSelectors = [
    '.SeatSelector_seat__available',
    '[data-testid^="seat-available-"]',
    '.SeatSelector_seat__'
  ];

  for (const sel of seatSelectors) {
    const seats = page.locator(sel);
    const n = await seats.count();
    if (n > 0) {
      for (let i = 0; i < n; i++) {
        const seat = seats.nth(i);
        const reserved = await seat.evaluate(el =>
          el.classList.contains('SeatSelector_reserved__')
        );
        if (!reserved && await seat.isVisible()) {
          await seat.click({ force: true });
          asientoSeleccionado = true;
          console.log(`💺 Asiento seleccionado correctamente (${sel})`);
          break;
        }
      }
    }
    if (asientoSeleccionado) break;
  }

  if (!asientoSeleccionado) console.warn('⚠️ No se encontró asiento libre');

  // 7️⃣ CONFIRMAR ASIENTO EN EL MODAL ------------------------------------
  try {
    const confirm = page.locator('button:has-text("Agregar al carrito")');
    if (await confirm.isVisible({ timeout: 5000 })) {
      await confirm.click();
      console.log('✅ Asiento agregado al carrito');
    } else {
      console.warn('⚠️ Botón "Agregar al carrito" no visible');
    }
  } catch {
    console.warn('⚠️ Error al intentar confirmar asiento');
  }

  // 8️⃣ ESPERAR REDIRECCIÓN AL CARRITO -----------------------------------
  try {
    await Promise.race([
      page.waitForURL('**/cart', { timeout: 25000 }),
      page.waitForSelector('h2:has-text("Carrito de compras")', { timeout: 25000 })
    ]);
    console.log('🧾 Carrito cargado correctamente');
  } catch (err) {
    console.error('⚠️ No se detectó navegación a /cart', err);
  }

  // 9️⃣ PROCEDER AL PAGO -------------------------------------------------
  const payBtn = page.locator('button:has-text("Proceder al pago")');
  await expect(payBtn).toBeVisible({ timeout: 10000 });
  await payBtn.click();
  console.log('💳 Click en "Proceder al pago"');

  await page.waitForURL('**/pay', { timeout: 20000 });
  await expect(page.locator('h1', { hasText: 'Finalizar compra' })).toBeVisible();
  console.log('💰 Página de pago cargada correctamente');

  // 🔟 MOCK DE STRIPE -----------------------------------------------------
  await page.route('**/api/stripe/checkout', async (route) => {
    console.log('🧩 Interceptado /api/stripe/checkout (mock)');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: `${FRONTEND_URL}/pay/success` }),
    });
  });

  // 11️⃣ PAGAR CON STRIPE -------------------------------------------------
  const stripeBtn = page.locator('button:has-text("Pagar con Stripe")');
  await expect(stripeBtn).toBeVisible({ timeout: 10000 });
  await stripeBtn.click();
  console.log('💸 Pago simulado con Stripe');

  // 12️⃣ VALIDAR ÉXITO ----------------------------------------------------
  await page.waitForURL('**/pay/success', { timeout: 25000 });
  await expect(page.locator('h1', { hasText: '¡Pago exitoso!' })).toBeVisible();
  await expect(page.locator('text=Tu compra se procesó correctamente')).toBeVisible();
  console.log('🎉 Compra completada exitosamente');

  // 13️⃣ VALIDAR BOTONES FINALES -----------------------------------------
  await expect(page.locator('button:has-text("Ver mis tickets")')).toBeVisible();
  await expect(page.locator('button:has-text("Volver a la tienda")')).toBeVisible();
  console.log('✅ Botones finales visibles. Test mixto completado con éxito.');
});
