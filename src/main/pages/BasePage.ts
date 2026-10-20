import type { Page } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open(path: string) {
        await this.page.goto(`https://rahulshettyacademy.com/client${path}`);
    }

    async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle') {
        await this.page.waitForLoadState(state);
    }
}
