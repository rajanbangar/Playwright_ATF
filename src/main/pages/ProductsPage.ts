import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
    readonly productCards: Locator;
    readonly productTitles: Locator;
    readonly addToCartButtons: Locator;
    readonly cartButton: Locator;
    readonly cartBadge: Locator;

    constructor(page: Page) {
        super(page);
        this.productCards = page.locator('.card');
        this.productTitles = page.locator('.card-body b');
        this.addToCartButtons = page.locator('button:has-text("Add To Cart")');
        this.cartButton = page.locator('button[routerlink*="cart"]');
        this.cartBadge = page.locator('button[routerlink*="cart"] label');
    }

    async openProductsPage() {
        await this.open('#/dashboard');
        await this.waitForLoadState();
    }

    async getProductCount(): Promise<number> {
        return await this.productCards.count();
    }

    async getProductTitles(): Promise<string[]> {
        return await this.productTitles.allTextContents();
    }

    async addProductToCart(productName: string) {
        const productCard = this.productCards.filter({ hasText: productName });
        const addToCartBtn = productCard.locator('button:has-text("Add To Cart")');
        await addToCartBtn.click();
        // Wait for toast notification
        await this.page.waitForSelector('.toast-container', { state: 'visible', timeout: 10000 });
        await this.page.waitForSelector('.toast-container', { state: 'hidden', timeout: 10000 });
        await this.page.waitForTimeout(1000);
    }

    async addMultipleProductsToCart(productNames: string[]) {
        for (const productName of productNames) {
            await this.addProductToCart(productName);
        }
    }

    async getCartCount(): Promise<number> {
        const badgeText = await this.cartBadge.textContent();
        return badgeText ? parseInt(badgeText, 10) : 0;
    }

    async goToCart() {
        await this.cartButton.click();
        await this.page.waitForURL('**/#/dashboard/cart**');
        await this.waitForLoadState();
    }

    async isProductVisible(productName: string): Promise<boolean> {
        const productCard = this.productCards.filter({ hasText: productName });
        return await productCard.isVisible();
    }
}