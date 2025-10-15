import { Page, expect } from '@playwright/test';

/**
 * Helper reutilizable para login de usuario normal
 * Se usa en todos los flujos E2E que requieren autenticación.
 */
export async function login(page: Page) {
  await page.goto('http://localhost:5173/login');

  await page.fill('input[name="email"]', 'gian@hotmail.com');
  await page.fill('input[name="password"]', 'gian');

  await page.click('button:has-text("Iniciar Sesión")');

  // Esperar redirección al home
  await page.waitForURL('**/');
  await expect(page).toHaveURL(/.*\/$/);
}
