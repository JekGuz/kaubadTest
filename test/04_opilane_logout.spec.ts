import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php';

/**
 * Algseis: Kasutaja "opilane" logib sisse.
 * Tegevus: Ta vajutab nuppu "Logi välja".
 * Ootus: Kasutaja viiakse tagasi loginulehele (login/parool väljad on nähtavad).

 * Исходное состояние: ученик заходит как opilane/opilane.
 * Действие: нажимает "Logi välja".
 * Ожидание: возвращается на форму логина.
 */
test('opilane logout töötab', async ({ page }) => {
    // логин как opilane
    await page.goto(LOGIN_URL);
    await page.locator('#login').fill('opilane');
    await page.locator('#password').fill('opilane');
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    // нажимаем Logi välja
    await page.locator('input[type="submit"][value="Logi välja"]').click();

    // снова должны быть поля логина
    await expect(page).toHaveURL(/login2\.php/i);
    await expect(page.locator('#login')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
});
