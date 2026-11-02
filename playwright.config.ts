import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Load environment-specific .env file from src/main/resources/
const env = process.env.ENV || 'local';
const resourcesDir = path.resolve(__dirname, 'src/main/resources');
dotenv.config({ path: path.resolve(resourcesDir, `.env.${env}`) });
dotenv.config({ path: path.resolve(resourcesDir, '.env.example') }); // fallback to example

export default defineConfig({
  testDir: './src/tests/testcases',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://rahulshettyacademy.com/client/',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  // Configure screenshot output directory
  outputDir: 'test-results/screenshots',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
