import { test, expect } from '@playwright/test';
import { login } from './login';


const FRONTEND_URL = 'http://localhost:5173'; 

test.describe('🎟️ Flujo completo de compra con Stripe', () => {
  test('Usuario realiza compra exitosa simulando Stripe', async ({ page }) => {
    // 1️⃣ LOGIN
    await page.goto(`${FRONTEND_URL}/login`);

    // 2️⃣ ENTRAR A UN EVENTO (usa uno existente; cambiar ID si hace falta)
    await page.goto(`${FRONTEND_URL}/event/1`);
    await expect(page.locator('h1')).toBeVisible();

    // 3️⃣ SELECCIONAR ENTRADAS (no enumerado)
    const quantitySelect = page.locator('select#general-quantity');
    if (await quantitySelect.isVisible()) {
      await quantitySelect.selectOption('2');
    }

    // 4️⃣ AGREGAR AL CARRITO
    await page.click('button:has-text("Agregar al Carrito")');
    await page.waitForURL('**/cart');
    await expect(page.locator('h2', { hasText: 'Carrito de compras' })).toBeVisible();

    // 5️⃣ PROCEDER AL PAGO
    await page.click('button:has-text("Proceder al pago")');
    await page.waitForURL('**/pay');
    await expect(page.locator('h1', { hasText: 'Finalizar compra' })).toBeVisible();

    // 6️⃣ INTERCEPTAR (mockear) la llamada a /api/stripe/checkout
    await page.route('**/api/stripe/checkout', async (route) => {
      console.log('🧩 Mock de Stripe interceptado');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/pay/success' }), // simula redirección de Stripe
      });
    });

    // 7️⃣ CLICK EN PAGAR CON STRIPE
    const stripeButton = page.locator('button:has-text("Pagar con Stripe")');
    await expect(stripeButton).toBeVisible();
    await stripeButton.click();

    // 8️⃣ REDIRECCIÓN SIMULADA A /pay/success
    await page.waitForURL('**/pay/success');

    // 9️⃣ COMPROBAR ÉXITO
    await expect(page.locator('h1', { hasText: '¡Pago exitoso!' })).toBeVisible();
    await expect(page.locator('text=Tu compra se procesó correctamente')).toBeVisible();

    // 10️⃣ VALIDAR BOTONES FINALES
    await expect(page.locator('button:has-text("Ver mis tickets")')).toBeVisible();
    await expect(page.locator('button:has-text("Volver a la tienda")')).toBeVisible();

    console.log('✅ Test E2E de compra con Stripe finalizado con éxito');
  });
});
