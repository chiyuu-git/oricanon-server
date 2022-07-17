import { isMonthlyDate } from '@common/weekly';
import { chromium } from 'playwright';
import { PixivTagViewFetcher } from './pixiv-tag-view-fetcher';
// import { PixivTagInfoFetcher } from './pixiv-tag-info-fetcher';

// await getPixivCharaTagCount();

export async function fetchPixivTagViewCount() {
    const browser = await chromium.launch({
        // 'chrome' or 'msedge', 'chrome-beta', 'msedge-beta', 'msedge-dev', etc.
        channel: 'msedge',
        headless: false,
        slowMo: 300,
    });
    const context = await browser.newContext({ storageState: 'state.json' });

    const page = await context.newPage();
    await page.goto('https://dic.pixiv.net/a/%E5%94%90%E5%8F%AF%E5%8F%AF');

    const pixivTagViewFetcher = new PixivTagViewFetcher(page.request, isMonthlyDate(new Date()));
    // const pixivTagViewFetcher = new PixivTagViewFetcher(page.request, false);
    await pixivTagViewFetcher.getCharaTagViewCount();
    await pixivTagViewFetcher.getCoupleTagViewCount();

    // const pixivTagInfoFetcher = new PixivTagInfoFetcher(page.request, isMonthlyDate(new Date()));
    // await pixivTagInfoFetcher.getPixivCoupleTagCount();
}
