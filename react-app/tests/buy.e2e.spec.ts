import { test, expect } from '@playwright/test';
import { login } from './login'; // helper reutilizable para login

// 🌐 URL base del frontend (ajustá si tu Vite usa otro puerto)
const FRONTEND_URL = 'http://localhost:5173';

test.describe('🎟️ Flujo completo de compra con Stripe', () => {
  test('Usuario realiza compra exitosa simulando Stripe', async ({ page }) => {
    // 1️⃣ LOGIN (usa el helper)
    await login(page);

    // 2️⃣ ENTRAR A UN EVENTO (usa uno existente en tu base)
    await page.goto(`${FRONTEND_URL}/event/1`);
    await expect(page.locator('h1')).toBeVisible();

    // 3️⃣ SELECCIONAR ENTRADAS (no enumerado)
    const quantitySelect = page.locator('select#general-quantity');
    if (await quantitySelect.isVisible()) {
      await quantitySelect.selectOption('2');
      console.log('🎟️ 2 entradas seleccionadas');
    } else {
      console.warn('⚠️ No se encontró el selector de cantidad — puede que sea un evento enumerado');
    }

    // 4️⃣ AGREGAR AL CARRITO
    await page.click('button:has-text("Agregar al Carrito")');
    await page.waitForURL('**/cart');
    await expect(page.locator('h2', { hasText: 'Carrito de compras' })).toBeVisible();
    console.log('🛒 Entradas agregadas al carrito');

    // 5️⃣ PROCEDER AL PAGO
    await page.click('button:has-text("Proceder al pago")');
    await page.waitForURL('**/pay');
    await expect(page.locator('h1', { hasText: 'Finalizar compra' })).toBeVisible();
    console.log('💳 Página de pago cargada');

    // 6️⃣ INTERCEPTAR la llamada a Stripe Checkout
    await page.route('**/api/stripe/checkout', async (route) => {
      console.log('🧩 Mock de Stripe interceptado');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: `${FRONTEND_URL}/pay/success` }), // redirige a éxito
      });
    });

    // 7️⃣ CLICK EN "Pagar con Stripe"
    const stripeButton = page.locator('button:has-text("Pagar con Stripe")');
    await expect(stripeButton).toBeVisible();
    await stripeButton.click();

    // 8️⃣ REDIRECCIÓN SIMULADA A /pay/success
    await page.waitForURL('**/pay/success');
    console.log('✅ Redirección simulada a /pay/success');

    // 9️⃣ COMPROBAR ÉXITO
    await expect(page.locator('h1', { hasText: '¡Pago exitoso!' })).toBeVisible();
    await expect(page.locator('text=Tu compra se procesó correctamente')).toBeVisible();

    // 🔟 VALIDAR BOTONES FINALES
    await expect(page.locator('button:has-text("Ver mis tickets")')).toBeVisible();
    await expect(page.locator('button:has-text("Volver a la tienda")')).toBeVisible();

    console.log('🎉 Test E2E de compra con Stripe finalizado con éxito');
  });
});
