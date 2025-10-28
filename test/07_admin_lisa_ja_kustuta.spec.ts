import { test, expect, Page } from '@playwright/test';

const LOGIN_URL =
    process.env.LOGIN_URL ??
    'https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php';

/**
 * Algseis: Admin on edukalt sisse logitud ja viibib kaubade halduslehel.
 * Tegevus: Admin lisab kolm uut kaupa (unikaalsete nimedega), kontrollib, et need ilmuvad tabelisse,
 *          ja seejärel kustutab need read tabelist.
 * Ootus: Kõik lisatud kaubad ilmuvad pärast lisamist ning pärast kustutamist neid enam ei ole.
 *
 * Исходное состояние: админ успешно вошёл и находится на странице управления товарами.
 * Действие: админ добавляет три новых товара с уникальными именами, проверяет, что они появились в таблице,
 *           затем удаляет их.
 * Ожидание: все три добавленных товара появляются после добавления и полностью исчезают после удаления.
 */

async function loginAsAdmin(page: Page) {
    const user = process.env.ADMIN_USER ?? 'admin';
    const pass = process.env.ADMIN_PASS ?? 'admin';

    await page.goto(LOGIN_URL);
    await page.locator('#login').fill(user);
    await page.locator('#password').fill(pass);
    const loginBtn = page
        .getByRole('button', { name: 'Logi sisse' })
        .or(page.locator('input[type="submit"][value="Logi sisse"]'));
    await loginBtn.click();

    await expect(page.getByText('Tere, admin!')).toBeVisible();
}

async function addItem(page: Page, name: string, price: string, groupValue = '1') {
    const form = page.locator('form[action="kaubahaldus.php"]');
    await expect(form).toBeVisible();

    await page.locator('#nimetus').fill(name);
    await page.locator('select[name="kaubagrupi_id"]').selectOption(groupValue);
    await page.locator('#hind').fill(price);

    await page
        .locator('input[type="submit"][name="kaubalisamine"][value="Lisa kaup"]')
        .click();

    const row = page.locator('table tbody tr', {
        has: page.getByText(name, { exact: true }),
    });
    await expect(row).toBeVisible();
}

async function assertRowExists(page: Page, name: string) {
    const row = page.locator('table tbody tr', {
        has: page.getByText(name, { exact: true }),
    });
    await expect(row).toBeVisible();
}

async function deleteRow(page: Page, name: string) {
    const row = page.locator('table tbody tr', {
        has: page.getByText(name, { exact: true }),
    });
    await expect(row).toBeVisible();

    // Если появится confirm-диалог — автоматически принимаем
    const maybeDialog = page
        .waitForEvent('dialog')
        .then((d) => d.accept())
        .catch(() => { });

    await row.getByRole('link', { name: 'Kustuta' }).click();
    await maybeDialog;

    const maybeRow = page.locator('table tbody tr', {
        has: page.getByText(name, { exact: true }),
    });
    await expect(maybeRow).toHaveCount(0);
}

test('admin lisab 3 kaupa ja kustutab need (CRUD)', async ({ page }) => {
    await loginAsAdmin(page);

    const prefix = 'autotest_' + Date.now().toString().slice(-6);
    const items = [
        { name: `test_A`, price: '1.11', group: '1' },
        { name: `test_B`, price: '2.22', group: '2' },
        { name: `test_C`, price: '3.33', group: '3' },
    ];

    // Lisamine ja kontroll
    for (const it of items) {
        await addItem(page, it.name, it.price, it.group);
        await assertRowExists(page, it.name);
    }

    // Kustutamine pöördjärjekorras
    for (const it of items.slice().reverse()) {
        await deleteRow(page, it.name);
    }

    // Kontroll, et neid enam ei ole
    for (const it of items) {
        const row = page.locator('table tbody tr', {
            has: page.getByText(it.name, { exact: true }),
        });
        await expect(row).toHaveCount(0);
    }
});
