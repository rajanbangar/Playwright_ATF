import { test, expect } from '@playwright/test';
import { ProductsPage, CartPage, CheckoutPage } from '../../../main/pages';
import { dataLoader } from '../../../main/utils/data-loader';

test.describe('Rahul Shetty Academy - E2E Purchase Flow', () => {
    let productsPage: ProductsPage;
    let cartPage: CartPage;
    let checkoutPage: CheckoutPage;

    const testEmail = `testuser${Date.now()}@example.com`;
    const testPassword = 'Test@123';

    // Load test data from JSON files
    const usersData = dataLoader.getUsers();
    const productsData = dataLoader.getProducts();
    const checkoutData = dataLoader.getCheckout();

    test.beforeEach(async ({ page }) => {
        productsPage = new ProductsPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);

        // Register a new user and login
        await page.goto('https://rahulshettyacademy.com/client/#/auth/register');
        await page.waitForLoadState('networkidle');

        await page.fill('#firstName', usersData.validUser.firstName);
        await page.fill('#lastName', usersData.validUser.lastName);
        await page.fill('#userEmail', testEmail);
        await page.fill('#userMobile', usersData.validUser.phone);
        await page.fill('#userPassword', usersData.validUser.password);
        await page.fill('#confirmPassword', usersData.validUser.confirmPassword);
        await page.locator('input[type="radio"]').first().check();
        await page.locator('input[type="checkbox"]').check();
        await page.click('#login');
        await page.waitForTimeout(3000);

        // Navigate to login and login
        await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
        await page.waitForLoadState('networkidle');
        await page.fill('#userEmail', testEmail);
        await page.fill('#userPassword', testPassword);
        await page.click('#login');
        await page.waitForTimeout(5000);
    });

    test('should complete full purchase flow', async ({ page }) => {
        // Step 1: Add products to cart
        await productsPage.addMultipleProductsToCart(productsData.productsToAdd);

        // Verify cart count
        const cartCount = await productsPage.getCartCount();
        expect(cartCount).toBe(productsData.productsToAdd.length);

        // Step 2: Go to cart
        await productsPage.goToCart();

        // Wait for cart items to load
        await cartPage.cartProductTitles.first().waitFor({ state: 'visible', timeout: 10000 });

        // Verify products in cart
        const cartTitles = await cartPage.getCartProductTitles();
        for (const product of productsData.productsToAdd) {
            expect(cartTitles.some(title => title.includes(product))).toBeTruthy();
        }

        // Step 3: Proceed to checkout
        await cartPage.proceedToCheckout();

        // Step 4: Fill shipping details and place order
        await checkoutPage.fillShippingDetails(checkoutData.shipping);
        await checkoutPage.fillPaymentDetails(checkoutData.payment);
        await checkoutPage.placeOrder();

        // Step 5: Verify order confirmation
        await expect(checkoutPage.orderConfirmation).toBeVisible();
        const confirmationText = await checkoutPage.getOrderConfirmationText();
        expect(confirmationText.toLowerCase()).toContain('thankyou');

        // Get order ID
        const orderId = await checkoutPage.getOrderId();
        expect(orderId).toBeTruthy();
        console.log(`Order placed successfully with ID: ${orderId}`);
    });

    test('should add single product and verify cart', async () => {
        const productName = productsData.singleProduct;

        await productsPage.addProductToCart(productName);

        // Verify cart badge shows 1
        const cartCount = await productsPage.getCartCount();
        expect(cartCount).toBe(1);

        // Go to cart and verify
        await productsPage.goToCart();

        // Wait for cart items to load
        await cartPage.cartProductTitles.first().waitFor({ state: 'visible', timeout: 10000 });

        const isInCart = await cartPage.isProductInCart(productName);
        expect(isInCart).toBeTruthy();

        // Verify price is displayed
        const prices = await cartPage.getCartProductPrices();
        expect(prices.length).toBe(1);
        expect(prices[0]).toBeTruthy();
    });

    test('should remove product from cart', async () => {
        const productName = productsData.removeProduct;

        await productsPage.addProductToCart(productName);
        await productsPage.goToCart();

        // Wait for cart items to load
        await cartPage.cartProductTitles.first().waitFor({ state: 'visible', timeout: 10000 });

        // Verify product is in cart
        let isInCart = await cartPage.isProductInCart(productName);
        expect(isInCart).toBeTruthy();

        // Remove product
        await cartPage.removeProduct(productName);

        // Wait for cart to update - wait for the product to be removed
        await cartPage.page.waitForTimeout(2000);

        // Verify product is removed
        isInCart = await cartPage.isProductInCart(productName);
        expect(isInCart).toBeFalsy();

        // Verify cart is empty
        const itemCount = await cartPage.getCartItemCount();
        expect(itemCount).toBe(0);
    });
});