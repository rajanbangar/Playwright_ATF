import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
    readonly cartItems: Locator;
    readonly cartProductTitles: Locator;
    readonly checkoutButton: Locator;
    readonly continueShoppingButton: Locator;

    constructor(page: Page) {
        super(page);
        this.cartItems = page.getByRole('listitem').filter({ has: page.locator('.cartSection') });
        this.cartProductTitles = page.locator('.cartSection h3');
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
        this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
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
        // Find the cart item containing the product name
        const productItem = this.cartItems.filter({ hasText: productName });

        if (!(await productItem.isVisible())) {
            throw new Error(`Product "${productName}" not found in cart`);
        }

        // Remove button within the specific product item (delete button has btn-danger class)
        const removeBtn = productItem.locator('button.btn-danger').first();
        await removeBtn.waitFor({ state: 'visible', timeout: 10000 });
        await removeBtn.click();
        // Wait for product title to be removed from the cart DOM
        await this.page.waitForFunction((name) => {
            const titles = Array.from(document.querySelectorAll('.cartSection h3'));
            return !titles.some(t => t.textContent?.includes(name));
        }, productName, { timeout: 10000 });
        await this.page.waitForLoadState('networkidle');
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