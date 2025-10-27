import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php';

/**
 * Algseis: Kasutaja ei ole sisse logitud ja asub loginulehel.
 * Tegevus: Kasutaja "opilane" sisestab kasutajanime/parooli ja vajutab "Logi sisse".
 * Ootus: Kasutaja ei jää loginulehele. Lehel on näha tervitust ("Tere ...").
 
 * Исходное состояние: ученик не залогинен, стоит на странице логина.
 * Действие: вводит opilane/opilane и жмёт "Logi sisse".
 * Ожидание: его пускает дальше, отображается приветствие.
 */
test('opilane saab sisse', async ({ page }) => {
	await page.goto(LOGIN_URL);

	await page.locator('#login').fill('opilane');
	await page.locator('#password').fill('opilane');
	await page.locator('input[type="submit"][value="Logi sisse"]').click();

	await expect(page).not.toHaveURL(/login2\.php/i);
	await expect(page.getByText(/Tere/i)).toBeVisible();
});