import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
    readonly cartItems: Locator;
    readonly cartProductTitles: Locator;
    readonly checkoutButton: Locator;
    readonly continueShoppingButton: Locator;
    readonly removeButtons: Locator;

    constructor(page: Page) {
        super(page);
        this.cartItems = page.locator('.cartSection');
        this.cartProductTitles = page.locator('.cartSection h3');
        this.checkoutButton = page.locator('button:has-text("Checkout")');
        this.continueShoppingButton = page.locator('button:has-text("Continue Shopping")');
        this.removeButtons = page.locator('.removeWrap');
    }

    async openCartPage() {
        await this.open('#/dashboard/cart');
        await this.waitForLoadState();
    }

    async getCartItemCount(): Promise<number> {
        // Only count actual product rows (those with h3)
        return await this.cartProductTitles.count();
    }

    async getCartProductTitles(): Promise<string[]> {
        return await this.cartProductTitles.allTextContents();
    }

    async getCartProductPrices(): Promise<string[]> {
        // Get prices from product rows with h3 only
        const titles = await this.cartProductTitles.all();
        const prices: string[] = [];
        for (const title of titles) {
            const item = title.locator('..'); // parent element
            const text = await item.textContent();
            if (text) {
                const priceMatch = text.match(/\$\s*[\d,]+/);
                if (priceMatch) {
                    prices.push(priceMatch[0]);
                }
            }
        }
        return prices;
    }

    async removeProduct(productName: string) {
        // Find the index of the product in the cart
        const titles = await this.getCartProductTitles();
        const productIndex = titles.findIndex(title => title.includes(productName));
        
        if (productIndex === -1) {
            throw new Error(`Product "${productName}" not found in cart`);
        }

        // Each product has 3 cartSections: product info, price, buy now
        // The remove button (.removeWrap) is in the "Buy Now" section (3rd section per product)
        const removeBtn = this.removeButtons.nth(productIndex);
        await removeBtn.waitFor({ state: 'visible', timeout: 10000 });
        await removeBtn.click();
        await this.waitForLoadState();
    }

    async proceedToCheckout() {
        await this.checkoutButton.click();
        // Checkout URL is #/dashboard/order?prop=...
        await this.page.waitForURL('**/#/dashboard/order**');
        await this.waitForLoadState();
    }

    async continueShopping() {
        await this.continueShoppingButton.click();
        await this.page.waitForURL('**/#/dashboard**');
        await this.waitForLoadState();
    }

    async isProductInCart(productName: string): Promise<boolean> {
        // Check if product title exists in cart
        const titles = await this.getCartProductTitles();
        return titles.some(title => title.includes(productName));
    }

    async getTotalPrice(): Promise<number> {
        const prices = await this.getCartProductPrices();
        return prices.reduce((sum, price) => {
            const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
            return sum + (isNaN(numericPrice) ? 0 : numericPrice);
        }, 0);
    }
}