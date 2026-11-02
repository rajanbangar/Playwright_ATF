import { test as base } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { dataLoader } from '../utils/data-loader';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BasePage } from '../pages/BasePage';

type Fixtures = {
  apiClient: ApiClient;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  basePage: BasePage;
};

export const test = base.extend<Fixtures>({
  apiClient: async ({}, use) => {
    const baseURL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';
    const api = await ApiClient.create(baseURL);
    await use(api);
    await api.close();
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
});

export { expect } from '@playwright/test';
export { dataLoader };
