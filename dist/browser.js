import { chromium } from "playwright";
export class YelpBrowser {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }
    async initialize() {
        this.browser = await chromium.launch({
            headless: true,
            args: [
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
            ],
        });
        this.context = await this.browser.newContext({
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport: { width: 1280, height: 800 },
            locale: "en-US",
        });
        await this.context.addInitScript(() => {
            Object.defineProperty(navigator, "webdriver", {
                get: () => undefined,
            });
        });
        this.page = await this.context.newPage();
    }
    async getPage() {
        if (!this.page) {
            throw new Error("Browser not initialized");
        }
        return this.page;
    }
    async navigate(url) {
        const page = await this.getPage();
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    }
    async waitForSelector(selector, timeout = 10000) {
        const page = await this.getPage();
        await page.waitForSelector(selector, { timeout });
    }
    async evaluate(fn) {
        const page = await this.getPage();
        return page.evaluate(fn);
    }
    async evaluateWithArg(fn, arg) {
        const page = await this.getPage();
        return page.evaluate(fn, arg);
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.context = null;
            this.page = null;
        }
    }
}
