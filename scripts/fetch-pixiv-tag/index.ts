import { isMonthlyDate } from '@common/weekly';
import { chromium } from 'playwright';
import { PixivTagFetcher } from './pixiv-tag-fetcher';

// await getPixivCharaTagCount();

export async function fetchPixivTagCount() {
    const browser = await chromium.launch({
        // 'chrome' or 'msedge', 'chrome-beta', 'msedge-beta', 'msedge-dev', etc.
        channel: 'msedge',
        headless: false,
        slowMo: 300,
    });
    const context = await browser.newContext({ storageState: 'state.json' });
    const page = await context.newPage();
    page.goto('https://www.pixiv.net/tags/%E5%94%90%E5%8F%AF%E5%8F%AF', { timeout: 0 });
    await page.waitForTimeout(10_000);

    // Interact with login form
    await page.click('text=登录', { delay: 1000, force: true });
    await page.fill('input[autocomplete="username"]', '873705939@qq.com');
    await page.fill('input[autocomplete="current-password"]', '985217750');
    await page.click('text=登录');
    await page.waitForTimeout(3000);
    await context.storageState({ path: 'state.json' });

    // const pixivTagInfoFetcher = new PixivTagFetcher(page.request, false);
    const pixivTagInfoFetcher = new PixivTagFetcher(page.request, !isMonthlyDate(new Date()));
    await pixivTagInfoFetcher.getPixivCharaTagCount();
    await pixivTagInfoFetcher.getPixivCoupleTagCount();
}
