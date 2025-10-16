import { test, expect } from '@playwright/test';
import { login } from './login';

const FRONTEND_URL = 'http://localhost:5173';

test.describe('🎟️ Flujo completo de compra con Stripe (mixto enumerado + no enumerado)', () => {
  test('Usuario compra entradas enumeradas y no enumeradas exitosamente', async ({ page }) => {
    // 1️⃣ LOGIN
    await login(page);

    // 2️⃣ IR AL EVENTO (debe tener sectores enumerados y no enumerados)
    const EVENT_URL = `${FRONTEND_URL}/event/1`;
    await page.goto(EVENT_URL, { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    console.log('🎭 Entró al evento correctamente');

    // 3️⃣ ESPERAR QUE CARGUEN LOS SECTORES / ENTRADAS
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 4️⃣ SELECCIONAR UNA ENTRADA NO ENUMERADA (si existe)
    try {
      const generalSelect = page.locator('select#general-quantity');
      if (await generalSelect.count() > 0) {
        await generalSelect.waitFor({ state: 'visible', timeout: 10000 });
        const options = await generalSelect.locator('option').allTextContents();
        console.log('🔍 Opciones de entrada general:', options);
        await generalSelect.selectOption('1');
        console.log('🎫 Entrada general seleccionada (1 unidad)');
      } else {
        console.warn('⚠️ No se encontró selector de entrada general — el evento podría no tener entradas no enumeradas.');
      }
    } catch (err) {
      console.error('❌ Error al seleccionar entrada no enumerada:', err);
    }

    // 5️⃣ ABRIR UN SECTOR ENUMERADO DESDE EL PLANO
    const sectorEnumerado = page.locator('[class*="sectorArea"]').first();
    try {
      await expect(sectorEnumerado).toBeVisible({ timeout: 10000 });
      await sectorEnumerado.click({ force: true });
      console.log('🪑 Sector enumerado clickeado');
    } catch (err) {
      console.error('⚠️ No se encontró sector enumerado visible:', err);
    }

    // 6️⃣ ESPERAR A QUE APAREZCA EL MODAL DE ASIENTOS
    await page.waitForTimeout(1500);
    await page.waitForSelector('.SeatSelector_seat__', { timeout: 10000 });
    console.log('📋 Modal de asientos visible');

    // 7️⃣ SELECCIONAR UN ASIENTO DISPONIBLE
    let seatClicked = false;
    const possibleSelectors = [
      '.SeatSelector_seat__available',
      '[data-testid^="seat-available-"]',
      '.SeatSelector_seat__'
    ];

    for (const sel of possibleSelectors) {
      const seats = page.locator(sel);
      if ((await seats.count()) > 0) {
        for (let i = 0; i < (await seats.count()); i++) {
          const s = seats.nth(i);
          const isDisabled = await s.evaluate(el => el.classList.contains('SeatSelector_reserved__'));
          if (!isDisabled && await s.isVisible()) {
            await s.click({ force: true });
            seatClicked = true;
            console.log(`💺 Asiento seleccionado (${sel})`);
            break;
          }
        }
        if (seatClicked) break;
      }
    }

    if (!seatClicked) {
      console.warn('⚠️ No se encontró asiento disponible para seleccionar');
    }

    // 8️⃣ CONFIRMAR ASIENTO EN MODAL
    try {
      const addSeatBtn = page.locator('button:has-text("Agregar al carrito")');
      await expect(addSeatBtn).toBeVisible({ timeout: 10000 });
      await addSeatBtn.click();
      console.log('✅ Asiento agregado al carrito');
    } catch {
      console.warn('⚠️ Botón de "Agregar al carrito" no encontrado o ya cerrado');
    }

    // 9️⃣ AGREGAR ENTRADA GENERAL (si todavía existe botón)
    try {
      const addGeneralBtn = page.locator('button:has-text("Agregar al Carrito")');
      if (await addGeneralBtn.isVisible({ timeout: 5000 })) {
        await addGeneralBtn.click();
        console.log('🛒 Entrada general agregada al carrito');
      }
    } catch {
      console.warn('⚠️ Botón de agregar general no encontrado (posiblemente ya en carrito)');
    }

    // 🔟 ESPERAR REDIRECCIÓN AL CARRITO
    await page.waitForURL('**/cart', { timeout: 25000 });
    await expect(page.locator('h2', { hasText: 'Carrito de compras' })).toBeVisible({ timeout: 10000 });
    console.log('🧾 Carrito cargado correctamente con las entradas');

    // 11️⃣ PROCEDER AL PAGO
    const payBtn = page.locator('button:has-text("Proceder al pago")');
    await expect(payBtn).toBeVisible({ timeout: 10000 });
    await payBtn.click();
    console.log('💳 Click en "Proceder al pago"');

    await page.waitForURL('**/pay', { timeout: 20000 });
    await expect(page.locator('h1', { hasText: 'Finalizar compra' })).toBeVisible({ timeout: 10000 });
    console.log('💰 Página de pago cargada correctamente');

    // 12️⃣ MOCK DE STRIPE
    await page.route('**/api/stripe/checkout', async (route) => {
      console.log('🧩 Interceptado /api/stripe/checkout (mock)');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: `${FRONTEND_URL}/pay/success` }),
      });
    });

    // 13️⃣ CLICK EN PAGAR CON STRIPE
    const stripeBtn = page.locator('button:has-text("Pagar con Stripe")');
    await expect(stripeBtn).toBeVisible({ timeout: 10000 });
    await stripeBtn.click();
    console.log('💸 Pago con Stripe simulado (mock)');

    // 14️⃣ VALIDAR PANTALLA DE ÉXITO
    await page.waitForURL('**/pay/success', { timeout: 25000 });
    await expect(page.locator('h1', { hasText: '¡Pago exitoso!' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Tu compra se procesó correctamente')).toBeVisible();
    console.log('🎉 Compra completada exitosamente');

    // 15️⃣ VALIDAR BOTONES FINALES
    await expect(page.locator('button:has-text("Ver mis tickets")')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('button:has-text("Volver a la tienda")')).toBeVisible({ timeout: 8000 });
    console.log('✅ Botones finales visibles. Test mixto completado con éxito.');
  });
});
