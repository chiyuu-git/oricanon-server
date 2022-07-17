import { APIRequestContext, APIResponse } from 'playwright';

export abstract class BrowserFetcher {
    browserFetch: (url: string) => Promise<APIResponse>;

    onlyActive: boolean;

    constructor(apiRequest: APIRequestContext, onlyActive: boolean) {
        this.browserFetch = (url: string) => apiRequest.fetch(url, { ignoreHTTPSErrors: true });
        this.onlyActive = onlyActive;
    }
}
