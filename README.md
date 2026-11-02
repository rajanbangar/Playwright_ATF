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
- `src/main/fixtures/` - Playwright test fixtures (shared clients, page objects, data loader)
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

Run smoke tests only:
```bash
npx playwright test --grep @smoke
```

Run regression tests only:
```bash
npx playwright test --grep @regression
```

## Test Data

Test data is stored in JSON files under `src/tests/inputData/`:
- `users.json` - Valid/invalid user credentials
- `products.json` - Product names and test scenarios
- `checkout.json` - Shipping and payment details

Data is loaded via `src/main/utils/data-loader.ts` using a singleton pattern.

## Environment

Environment profiles are supported through the `ENV` variable. Environment files live in `src/main/resources/`. Create a `.env` file from `src/main/resources/.env.example` and set `ENV=local`, `ENV=staging`, or `ENV=production`. The configuration loads `src/main/resources/.env.<ENV>` first, then falls back to `src/main/resources/.env.example`.

Example `.env`:
```
ENV=local
BASE_URL=https://rahulshettyacademy.com/client/
API_BASE_URL=https://jsonplaceholder.typicode.com
CI=false
```

To run against staging:
```bash
set ENV=staging
npm test
```

To run against production:
```bash
set ENV=production
npm test
```

## Allure reporting

Allure is integrated through the Playwright reporter and writes results to `allure-results`.

Run:

```bash
npm run test:allure
npm run allure:generate
npm run allure:open
```

> Note: Allure HTML generation requires Java to be installed and JAVA_HOME configured in the environment.
> On Windows, install a JDK such as Temurin 21 and then set JAVA_HOME before running the generation step.

## Framework Architecture

The framework follows a layered design that separates concerns across configuration, data, API, page objects, tests, and reporting.

### Layer 1 Configuration and Environment
The configuration layer centralizes test execution settings. It defines the test directory, timeouts, parallelism, retry behavior, browser matrix, reporters, output directories, and environment variable loading. Browser projects include Chromium, Firefox, and WebKit. CI environments automatically adjust worker count and retries, while local runs use optimized defaults.

### Layer 2 Test Data
Test data is decoupled from test logic and stored in JSON files. A singleton data loader reads users, products, and checkout information from the input data folder. Typed interfaces describe the shape of users, products, shipping details, and payment details, providing compile-time safety and making it easy for non-developers to update fixtures without touching source code.

### Layer 3 API Client
The API layer wraps Playwright's request context into a reusable client. It supports GET, POST, PUT, PATCH, and DELETE requests with generic response typing, returns both parsed body and raw response for flexible assertions, and exposes a factory method for context creation. The client is provided as a Playwright test fixture for shared use across API tests.

### Layer 4 Page Object Model
The UI layer uses the Page Object Model pattern. A base page provides navigation and load-state helpers shared across all pages. Dedicated page classes encapsulate locators and business actions for products, cart, and checkout. Locators are stabilized using Playwright's user-facing locators (`getByRole`, `getByPlaceholder`, `getByLabel`) rather than brittle index-based selectors. Barrel exports keep imports clean in test specifications. Page objects are provided as Playwright test fixtures for reuse across test specifications.

### Layer 5 Test Specifications
Test specifications contain the actual test cases divided into UI and API categories. UI tests cover the full purchase flow, single product addition, and product removal. API tests cover GET, POST, and update scenarios against a public JSON placeholder service. Each test is isolated with its own page or API context.

### Layer 6 Reporting and Observability
The reporting layer integrates Allure and Playwright's built-in HTML reporter. Test artifacts include traces on first retry, screenshots on failure, and videos retained on failure. Allure results are written to a results directory and can be generated into a browsable report for trend analysis and failure categorization.

## AI Integration Layers

The framework includes the Google Gemini CLI dependency, enabling artificial intelligence to augment several layers without rewriting the existing architecture.

### AI Test Data Generation
AI can generate variants of test users, products, and checkout records on demand, including boundary values, invalid emails, special characters, and multi-locale addresses. This reduces manual JSON maintenance and expands edge-case coverage.

### AI Self-Healing Locators
When a UI locator fails because the application changed, AI can analyze the page HTML and error context to suggest alternative stable selectors based on roles, text, or attributes. This reduces maintenance effort as the application under test evolves.

### AI Test Generation and Maintenance
AI can convert user stories or acceptance criteria into Playwright specifications using existing page objects. It can also analyze test failures, traces, and DOM snapshots to suggest root causes and code fixes, such as replacing brittle index-based locators or hardcoded waits.

### AI API Contract Intelligence
AI can infer TypeScript interfaces from API responses, generate negative test payloads with missing fields or wrong types, and create realistic mock responses for offline or continuous integration testing.

### AI Report Analysis and Flaky Test Detection
After each run, AI can consume Allure results, traces, and console logs to identify flaky tests, summarize root causes, and recommend fixes. This automates triage for large parallel test suites.

## Test Fixtures

Shared fixtures are defined in `src/main/fixtures/test-fixtures.ts` using Playwright's `test.extend()`. Tests import `test` and `expect` from this fixture module instead of directly from `@playwright/test`. Available fixtures:

- `apiClient` - shared `ApiClient` instance, automatically created and closed per test
- `productsPage` - instantiated `ProductsPage`
- `cartPage` - instantiated `CartPage`
- `checkoutPage` - instantiated `CheckoutPage`
- `basePage` - instantiated `BasePage`
- `dataLoader` - singleton data loader with cached fixtures

## Test Tags

Tests are tagged for selective execution using Playwright's `--grep` option:

- `@smoke` - critical purchase flow tests
- `@regression` - full API and UI test coverage

Run smoke tests: `npx playwright test --grep @smoke`
Run regression tests: `npx playwright test --grep @regression`

## Scalability

### Strengths
The framework scales well across browsers through its explicit project matrix. Full parallel execution distributes tests across workers. CI-aware configuration adjusts retries and worker counts automatically. The Page Object Model supports high reusability, and TypeScript provides compile-time safety. Separating test data into JSON files allows non-technical contributors to manage fixtures. Test data is cached at startup to avoid repeated file I/O. Shared fixtures reduce boilerplate in test specifications. Environment profiles enable testing against local, staging, and production targets.

### Limitations
Locator fragility from index-based selectors has been reduced but some payment form fields still rely on positional selectors until the application under test adds stable attributes such as `data-testid` or accessible labels.

Longer-term scalability can be achieved through AI-powered self-healing locators, dynamic AI-generated test data, visual regression testing with AI-powered diff analysis, auto-generated specifications from requirements, and distributed sharded execution across continuous integration nodes.
