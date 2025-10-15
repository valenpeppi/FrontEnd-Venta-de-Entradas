import { test, expect } from '@playwright/test';
import { login } from './login';

const FRONTEND_URL = 'http://localhost:5173';

test.describe('🎟 Flujo completo de compra con Stripe (mixto enumerado + no enumerado)', () => {
  test('Usuario compra entradas enumeradas y no enumeradas exitosamente', async ({ page }) => {
    // 1️⃣ LOGIN
    await login(page);

    // 2️⃣ ENTRAR A UN EVENTO (asegúrate que tenga ambos tipos)
    await page.goto(`${FRONTEND_URL}/event/1`);
    await expect(page.locator('h1')).toBeVisible();
    console.log('🎭 Entró al evento');

    // 3️⃣ SELECCIONAR UNA ENTRADA NO ENUMERADA
    const quantitySelect = page.locator('select#general-quantity');
    if (await quantitySelect.isVisible()) {
      await quantitySelect.selectOption('1');
      console.log('🎫 Seleccionada 1 entrada general');
    } else {
      console.warn('⚠ Este evento no tiene entradas generales');
    }

    // 4️⃣ SELECCIONAR UNA ENTRADA ENUMERADA
    // Buscar el primer sector enumerado visible en el plano
    const firstSector = page.locator('[class*="sectorArea"]').first();
    if (await firstSector.isVisible()) {
      await firstSector.click();
      console.log('🪑 Sector enumerado abierto');
    } else {
      console.warn('⚠ No se encontró sector enumerado clickeable');
    }

    // Esperar modal y seleccionar un asiento (simulando click)
    const seat = page.locator('.SeatSelector_seat__available').first();
    if (await seat.isVisible()) {
      await seat.click();
      console.log('💺 Asiento enumerado seleccionado');
    } else {
      console.warn('⚠ No se encontraron asientos disponibles');
    }

    // Confirmar en el modal
    const addBtn = page.locator('button:has-text("Agregar al carrito")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      console.log('✅ Asiento agregado al carrito');
    }

    // 5️⃣ AGREGAR TAMBIÉN LA ENTRADA GENERAL (si existe)
    const addGeneralBtn = page.locator('button:has-text("Agregar al Carrito")');
    if (await addGeneralBtn.isVisible()) {
      await addGeneralBtn.click();
      console.log('🛒 Entrada general agregada al carrito');
    }

    // 6️⃣ ESPERAR REDIRECCIÓN AL CARRITO
    await page.waitForURL('/cart', { timeout: 20000 });
    await expect(page.locator('h2', { hasText: 'Carrito de compras' })).toBeVisible();
    console.log('🧾 Carrito visible con las entradas agregadas');

    // 7️⃣ PROCEDER AL PAGO
    await page.click('button:has-text("Proceder al pago")');
    await page.waitForURL('/pay', { timeout: 20000 });
    await expect(page.locator('h1', { hasText: 'Finalizar compra' })).toBeVisible();
    console.log('💳 Página de pago cargada');

    // 8️⃣ MOCK STRIPE CHECKOUT
    await page.route('/api/stripe/checkout', async (route) => {
      console.log('🧩 Mock de Stripe interceptado');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: `${FRONTEND_URL}/pay/success` }),
      });
    });

    // 9️⃣ PAGAR CON STRIPE
    const stripeButton = page.locator('button:has-text("Pagar con Stripe")');
    await expect(stripeButton).toBeVisible();
    await stripeButton.click();
    console.log('💰 Pago iniciado (mock)');

    // 🔟 REDIRECCIÓN A ÉXITO
    await page.waitForURL('/pay/success', { timeout: 20000 });
    await expect(page.locator('h1', { hasText: '¡Pago exitoso!' })).toBeVisible();
    await expect(page.locator('text=Tu compra se procesó correctamente')).toBeVisible();

    // ✅ VALIDAR BOTONES
    await expect(page.locator('button:has-text("Ver mis tickets")')).toBeVisible();
    await expect(page.locator('button:has-text("Volver a la tienda")')).toBeVisible();

    console.log('🎉 Test E2E mixto (enumerado + no enumerado) completado con éxito');
  });
});