import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './test',
    reporter: 'list',
    use: {
        baseURL: 'https://jekaterinaguzek24.thkit.ee/php/content/kaubad/login2.php',
        trace: 'on-first-retry'
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
    ]
});