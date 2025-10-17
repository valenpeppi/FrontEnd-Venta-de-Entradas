import { Page, expect } from '@playwright/test';


export async function login(page: Page) {
  await page.goto('http://localhost:5173/login');

  await page.fill('input[name="email"]', 'gian@hotmail.com');
  await page.fill('input[name="password"]', 'gian');

  await page.click('button:has-text("Iniciar Sesión")');

  await page.waitForURL('**/');
  await expect(page).toHaveURL(/.*\/$/);
}
