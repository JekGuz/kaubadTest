import { test, expect, Page } from '@playwright/test';

const LOGIN_URL = 'https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php';

/**
 * Algseis: Admin on edukalt sisse logitud.
 * Tegevus: Admin vaatab kaubade lehte.
 * Ootus: Näha on "Tere, admin!", tabel kaupadega, väljad uue kauba lisamiseks,
 *        lingid "Kustuta" ja "Muuda", ning nupp "Logi välja".

 * Исходное состояние: админ вошёл.
 * Действие: смотрит главную страницу управления товарами.
 * Ожидание: есть приветствие, таблица с товарами, форма добавления нового товара,
 *           ссылки Kustuta/Muuda, кнопка выхода.
 */

// вспомогательная функция логина админа
async function loginAsAdmin(page: Page) {
    await page.goto(LOGIN_URL);
    await page.locator('#login').fill('admin');
    await page.locator('#password').fill('admin');
    await page.locator('input[type="submit"][value="Logi sisse"]').click();
    await expect(page.getByText('Tere, admin!')).toBeVisible();
}

test('admini vaade: tabel, vorm ja halduslingid', async ({ page }) => {
    await loginAsAdmin(page);

    // 1. Приветствие и заголовки
    await expect(page.getByText('Tere, admin!')).toBeVisible();
    await expect(page.getByText('Kaupade leht')).toBeVisible();
    await expect(page.getByText('Kaubad / Kaubagrupid')).toBeVisible();

    // 2. Таблица товаров не пустая
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // 3. В первой строке таблицы есть ссылки "Kustuta" и "Muuda"
    const firstRow = rows.first();
    await expect(firstRow.getByRole('link', { name: 'Kustuta' })).toBeVisible();
    await expect(firstRow.getByRole('link', { name: 'Muuda' })).toBeVisible();

    // 4. Есть форма "Kauba lisamine": nimetus, hind, kaubagrupp, кнопка Lisa kaup
    await expect(page.locator('#nimetus')).toBeVisible();
    await expect(page.locator('select[name="kaubagrupi_id"]')).toBeVisible();
    await expect(page.locator('#hind')).toBeVisible();
    await expect(
        page.locator('input[type="submit"][name="kaubalisamine"][value="Lisa kaup"]')
    ).toBeVisible();

    // 5. В поля можно что-то ввести (но не сабмитим, чтобы не портить БД)
    await page.locator('#nimetus').fill('testikaup123');
    await page.locator('#hind').fill('9.99');
    await expect(page.locator('#nimetus')).toHaveValue('testikaup123');
    await expect(page.locator('#hind')).toHaveValue('9.99');

    // 6. У админа видна кнопка "Logi välja"
    await expect(
        page.locator('input[type="submit"][value="Logi välja"]')
    ).toBeVisible();
});
