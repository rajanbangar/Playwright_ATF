import { test, expect, dataLoader } from '../../../main/fixtures/test-fixtures';

const testEmail = `rajanbangar@gmail.com`;
const testPassword = 'Rajan@28';

test.describe('Rahul Shetty Academy - E2E Purchase Flow', () => {
    // Load test data from JSON files (cached at startup)
    const productsData = dataLoader.getProducts();
    const checkoutData = dataLoader.getCheckout();

    test.beforeEach(async ({ basePage }) => {
        // Navigate to login and login
        await basePage.open('#/auth/login');
        await basePage.page.waitForLoadState('networkidle');
        await basePage.page.fill('#userEmail', testEmail);
        await basePage.page.fill('#userPassword', testPassword);
        await basePage.page.click('#login');
        await basePage.page.waitForURL('**/#/dashboard**');
    });

    test('should complete full purchase flow', { tag: ['@smoke', '@regression'] },
        async ({ productsPage, cartPage, checkoutPage }) => {
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

    test('should add single product and verify cart', { tag: ['@smoke', '@regression'] },
        async ({ productsPage, cartPage }) => {
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

    test('should remove product from cart', { tag: ['@regression'] },
        async ({ productsPage, cartPage }) => {
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

            // Wait for cart to update after removal
            await cartPage.page.waitForLoadState('networkidle');

            // Verify product is removed
            isInCart = await cartPage.isProductInCart(productName);
            expect(isInCart).toBeFalsy();

            // Verify cart is empty
            const itemCount = await cartPage.getCartItemCount();
            expect(itemCount).toBe(0);
        });
});