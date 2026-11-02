import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
    readonly countryInput: Locator;
    readonly countryDropdown: Locator;
    readonly placeOrderLink: Locator;
    readonly orderConfirmation: Locator;
    readonly orderId: Locator;
    readonly downloadInvoiceButton: Locator;
    readonly monthSelect: Locator;
    readonly daySelect: Locator; // Second dropdown is day, not year
    readonly cvvInput: Locator;
    readonly nameOnCardInput: Locator;

    constructor(page: Page) {
        super(page);
        // Country autocomplete input
        this.countryInput = page.getByPlaceholder('Select Country');
        this.countryDropdown = page.locator('.ta-results button');
        // Payment details
        this.monthSelect = page.locator('select').first(); // Month (01-12) - TODO: add data-testid or accessible label
        this.daySelect = page.locator('select').nth(1); // Day (01-31) - TODO: add data-testid or accessible label
        // CVV and name on card inputs - TODO: add data-testid or accessible label for stable selection
        this.cvvInput = page.getByPlaceholder(/cvv/i).or(page.locator('input.input.txt').nth(2));
        this.nameOnCardInput = page.getByPlaceholder(/name on card/i).or(page.locator('input.input.txt').nth(3));
        // Place Order is a link, not a button
        this.placeOrderLink = page.locator('a.btnn.action__submit, a:has-text("Place Order")').first();
        this.orderConfirmation = page.locator('.hero-primary').first();
        this.orderId = page.locator('.em-spacer-1 .ng-star-inserted').first();
        this.downloadInvoiceButton = page.getByRole('button', { name: 'Download Invoice' });
    }

    async openCheckoutPage() {
        await this.open('#/dashboard/order');
        await this.waitForLoadState();
    }

    async fillShippingDetails(data: {
        country: string;
    }) {
        // Select country
        await this.countryInput.pressSequentially(data.country, { delay: 100 });
        await this.page.waitForSelector('.ta-results', { state: 'visible' });
        const countryOption = this.countryDropdown.filter({ hasText: data.country });
        await countryOption.first().click();
    }

    async getCountryDropdown() {
        return this.countryDropdown;
    }

    async fillPaymentDetails(data: {
        cvv: string;
        nameOnCard: string;
        month: string;
        day: string; // Changed from year to day
    }) {
        await this.cvvInput.fill(data.cvv);
        await this.nameOnCardInput.fill(data.nameOnCard);
        await this.monthSelect.selectOption(data.month);
        await this.daySelect.selectOption(data.day);
    }

    async placeOrder() {
        await this.placeOrderLink.click();
        await this.page.waitForSelector('.hero-primary', { state: 'visible', timeout: 30000 });
    }

    async getOrderConfirmationText(): Promise<string> {
        return await this.orderConfirmation.textContent() ?? '';
    }

    async getOrderId(): Promise<string> {
        const text = await this.orderId.textContent() ?? '';
        // Extract order ID from text like "Your order Id is | 12345 |"
        const match = text.match(/\|\s*(.+?)\s*\|/);
        return match ? match[1].trim() : text.trim();
    }

    async downloadInvoice() {
        const downloadPromise = this.page.waitForEvent('download');
        await this.downloadInvoiceButton.click();
        return await downloadPromise;
    }

    async isOrderConfirmationVisible(): Promise<boolean> {
        return await this.orderConfirmation.isVisible();
    }
}