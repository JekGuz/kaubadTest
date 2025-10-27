import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php';

/**
 * Algseis: Admin ei ole sisse logitud ja asub loginulehel.
 * Tegevus: Admin sisestab "admin/admin" ja vajutab "Logi sisse".
 * Ootus: Avaneb adminivaade, kus on tekst "Tere, admin!".

 * Исходное состояние: админ не залогинен.
 * Действие: вводит admin/admin, жмёт "Logi sisse".
 * Ожидание: видит текст "Tere, admin!".
 */
test('admin saab sisse', async ({ page }) => {
    await page.goto(LOGIN_URL);

    await page.locator('#login').fill('admin');
    await page.locator('#password').fill('admin');
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    await expect(page.getByText('Tere, admin!')).toBeVisible();
});