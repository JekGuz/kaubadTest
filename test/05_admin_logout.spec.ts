import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php';

/**
 * Algseis: Admin logib sisse (admin/admin).
 * Tegevus: Vajutab "Logi välja".
 * Ootus: Ta viiakse tagasi loginulehele.
 
 * Исходное состояние: админ залогинен.
 * Действие: жмёт "Logi välja".
 * Ожидание: возвращается на login-страницу.
 */
test('admin logout töötab', async ({ page }) => {
    // логин как admin
    await page.goto(LOGIN_URL);
    await page.locator('#login').fill('admin');
    await page.locator('#password').fill('admin');
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    await expect(page.getByText('Tere, admin!')).toBeVisible();

    // logout
    await page.locator('input[type="submit"][value="Logi välja"]').click();

    // проверяем возврат на логин
    await expect(page).toHaveURL(/login2\.php/i);
    await expect(page.locator('#login')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
});
