import { test, expect, Page } from '@playwright/test';

// адрес страницы логина
const LOGIN_URL = 'https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php';

// маленький helper, чтобы логиниться админом
// добавили тип { page }: Page → это чинит TS7006
async function loginAsAdmin(page: Page) {
    await page.goto(LOGIN_URL);

    await page.locator('#login').fill('admin');
    await page.locator('#password').fill('admin');
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    // убеждаемся что реально зашли как админ
    await expect(page.getByText('Tere, admin!')).toBeVisible();
}

// ──────────────────────────────────────────────
// BLOKK 1: sisse logimine / välja logimine
// (логин / логаут)
// ─────────────────────────────────────────────-

// 1. opilane saab sisse
//    проверка: ученик может войти с логином/parool opilane/opilane
test('opilane saab sisse', async ({ page }) => {
    // открываем логин-страницу
    await page.goto(LOGIN_URL);

    // вводим логин/пароль
    await page.locator('#login').fill('opilane');
    await page.locator('#password').fill('opilane');

    // нажимаем "Logi sisse"
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    // проверяем, что нас пустило дальше (URL уже не login2.php)
    await expect(page).not.toHaveURL(/login2\.php/i);

    // проверяем, что на новой странице есть приветствие "Tere ..."
    await expect(page.getByText(/Tere/i)).toBeVisible();
});

// 2. admin saab sisse
//    проверка: админ может войти с admin/admin и видит "Tere, admin!"
test('admin saab sisse', async ({ page }) => {
    await page.goto(LOGIN_URL);

    await page.locator('#login').fill('admin');
    await page.locator('#password').fill('admin');
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    // после входа должен быть текст "Tere, admin!"
    await expect(page.getByText('Tere, admin!')).toBeVisible();
});

// 3. vale parool annab vea
//    проверка: если ввести неправильный пароль, вход НЕ происходит
test('vale parool annab vea', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // пробуем неправильный пароль
    await page.locator('#login').fill('opilane');
    await page.locator('#password').fill('midagi_vale');
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    // мы должны ОСТАТЬСЯ на login странице
    await expect(page).toHaveURL(/login2\.php/i);

    // поля логина всё ещё видны -> нас не пустило
    await expect(page.locator('#login')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // сюда потом можно добавить проверку текста ошибки
});

// 4. opilane logout töötab
//    проверка: ученик может выйти по "Logi välja"
test('opilane logout töötab', async ({ page }) => {
    // сначала логинимся как opilane
    await page.goto(LOGIN_URL);
    await page.locator('#login').fill('opilane');
    await page.locator('#password').fill('opilane');
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    // нажимаем "Logi välja"
    await page.locator('input[type="submit"][value="Logi välja"]').click();

    // мы снова должны оказаться на форме логина
    await expect(page).toHaveURL(/login2\.php/i);
    await expect(page.locator('#login')).toBeVisible();
});

// 5. admin logout töötab
//    проверка: админ может выйти по "Logi välja"
test('admin logout töötab', async ({ page }) => {
    // логинимся как admin
    await page.goto(LOGIN_URL);
    await page.locator('#login').fill('admin');
    await page.locator('#password').fill('admin');
    await page.locator('input[type="submit"][value="Logi sisse"]').click();

    // убеждаемся что видим "Tere, admin!"
    await expect(page.getByText('Tere, admin!')).toBeVisible();

    // выходим
    await page.locator('input[type="submit"][value="Logi välja"]').click();

    // обратно на логине
    await expect(page).toHaveURL(/login2\.php/i);
    await expect(page.locator('#login')).toBeVisible();
});

// ──────────────────────────────────────────────
// BLOKK 2: admini vaade
// (то, что доступно администратору после входа)
// ─────────────────────────────────────────────-

// 6. admin näeb kaupade tabelit
//    проверка: после входа как админ есть шапка и таблица с товарами
test('admin näeb kaupade tabelit', async ({ page }) => {
    await loginAsAdmin(page);

    // проверяем заголовки наверху
    await expect(page.getByText('Kaupade leht')).toBeVisible();
    await expect(page.getByText('Tere, admin!')).toBeVisible();
    await expect(page.getByText('Kaubad / Kaubagrupid')).toBeVisible();

    // таблица товаров не пустая
    // вместо toHaveCountGreaterThan делаем ручную проверку кол-ва строк
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
});

// 7. kauba lisamise vorm on olemas
//    проверка: админ видит форму "Kauba lisamine"
test('kauba lisamise vorm on olemas', async ({ page }) => {
    await loginAsAdmin(page);

    // поле "Nimetus:"
    await expect(page.locator('#nimetus')).toBeVisible();

    // поле/селект "Kaubagrupp:"
    await expect(page.locator('select[name="kaubagrupi_id"]')).toBeVisible();

    // поле "Hind:"
    await expect(page.locator('#hind')).toBeVisible();

    // кнопка "Lisa kaup"
    await expect(
        page.locator('input[type="submit"][name="kaubalisamine"][value="Lisa kaup"]')
    ).toBeVisible();
});

// 8. admin saab täita uue kauba andmed
//    проверка: в поля можно ввести название и цену
test('admin saab täita uue kauba andmed', async ({ page }) => {
    await loginAsAdmin(page);

    await page.locator('#nimetus').fill('testikaup123');
    await page.locator('#hind').fill('9.99');

    await expect(page.locator('#nimetus')).toHaveValue('testikaup123');
    await expect(page.locator('#hind')).toHaveValue('9.99');

    // форму не отправляем, чтоб не портить базу
});

// 9. iga rida sisaldab Kustuta ja Muuda
//    проверка: в первой строке таблицы есть ссылки "Kustuta" и "Muuda"
test('iga rida sisaldab Kustuta ja Muuda', async ({ page }) => {
    await loginAsAdmin(page);

    const firstRow = page.locator('table tbody tr').first();

    await expect(firstRow.getByRole('link', { name: 'Kustuta' })).toBeVisible();
    await expect(firstRow.getByRole('link', { name: 'Muuda' })).toBeVisible();
});

// 10. adminil on Logi välja nupp
//     проверка: после входа у админа есть кнопка выхода
test('adminil on Logi välja nupp', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(
        page.locator('input[type="submit"][value="Logi välja"]')
    ).toBeVisible();
});
