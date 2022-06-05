import { chromium, firefox } from 'playwright';

// https://playwright.dev/docs/api/class-page#page-fill
export async function fetchTwitterDetail() {
    const browser = await chromium.launch({
        // 'chrome' or 'msedge', 'chrome-beta', 'msedge-beta', 'msedge-dev', etc.
        channel: 'msedge',
        headless: false,
        slowMo: 50,
    });
    const context = await browser.newContext({ storageState: 'state.json' });
    const page = await context.newPage();
    await page.goto('https://twitter.com/home');
    // 有可能会过期的，每次登录都刷新一下
    await context.storageState({ path: 'state.json' });
    // await browser.close();

    // Interact with login form
    // await page.click('label');
    // await page.fill('input', 'imperkings@outlook.com');
    // await page.click('text=下一步');
    // await page.fill('input[name="password"]', 'Pang8737K');
    // await page.click('text=登录');
    // await page.waitForTimeout(3000);
    // await context.storageState({ path: 'state.json' });
}
