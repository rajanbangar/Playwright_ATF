# Playwright Automation Framework

This project is structured as a scalable Playwright test framework using:

- Page Object Model (POM)
- Browser/project config
- Environment variables
- Reusable utilities and fixtures
- Test data separation (JSON files)

## Folders

- `src/main/pages/` - reusable UI page classes (ProductsPage, CartPage, CheckoutPage)
- `src/main/api/` - reusable API request clients and helpers
- `src/main/utils/` - shared utility methods (data-loader, helpers)
- `src/main/resources/` - resource files such as `.env.example`
- `src/tests/inputData/` - test data files (JSON format)
- `src/tests/testcases/ui/` - UI test cases
- `src/tests/testcases/api/` - API test cases

## Target Application

Tests are configured for **Rahul Shetty Academy E-Commerce Practice Site**:
- Base URL: `https://rahulshettyacademy.com/client/`
- Login: `/auth/login`
- Products: `/dashboard`
- Cart: `/dashboard/cart`
- Checkout: `/dashboard/order`
- Orders: `/dashboard/myorders`
- Register: `/auth/register`

## Commands

```bash
npm install
npm test
npm run test:headed
npm run test:smoke
npm run test:report
```

## Test Data

Test data is stored in JSON files under `src/tests/inputData/`:
- `users.json` - Valid/invalid user credentials
- `products.json` - Product names and test scenarios
- `checkout.json` - Shipping and payment details

Data is loaded via `src/main/utils/data-loader.ts` using a singleton pattern.

## Environment

Use the example file in `src/main/resources/.env.example`, then copy it to `.env` and update values as needed:

```bash
copy src\main\resources\.env.example .env
```

## Allure reporting

Allure is integrated through the Playwright reporter and writes results to `allure-results`.

Run:

```bash
npm run test:allure
npm run allure:generate
npm run allure:open
```

> Note: Allure HTML generation requires Java to be installed and `JAVA_HOME` configured in the environment.
> On Windows, install a JDK such as Temurin 21 and then set `JAVA_HOME` before running the generation step.
