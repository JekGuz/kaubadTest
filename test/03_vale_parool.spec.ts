import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php';

/**
 * Algseis: Kasutaja on loginulehel.
 * Tegevus: Kasutaja sisestab vale parooli ja vajutab "Logi sisse".
 * Ootus: Kasutaja EI pääse edasi — jääb loginulehele, väljad on endiselt nähtavad.

 * Исходное состояние: пользователь на странице логина.
 * Действие: вводит неправильный пароль.
 * Ожидание: остаётся на login2.php, поля всё ещё видны.
 */
test('vale parool annab vea ja ei lase sisse', async ({ page }) => {
    await page.goto(LOGIN_URL);

    await page.locator('#login').fill('opilane');
    await page.locator('#password').fill('midagi_vale'); // неверный пароль
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    // остаёмся на login2.php
    await expect(page).toHaveURL(/login2\.php/i);

    // поля логина/пароля по-прежнему есть
    await expect(page.locator('#login')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // при желании можно добавить проверку текста ошибки (если он есть на странице)
});