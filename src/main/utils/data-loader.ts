import * as fs from 'fs';
import * as path from 'path';

export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface InvalidUser {
  email: string;
  password: string;
}

export interface Product {
  name: string;
  expectedPrice: string;
}

export interface ProductsData {
  products: Product[];
  productsToAdd: string[];
  singleProduct: string;
  removeProduct: string;
}

export interface ShippingData {
  country: string;
}

export interface PaymentData {
  cvv: string;
  nameOnCard: string;
  month: string;
  day: string;
}

export interface CheckoutData {
  shipping: ShippingData;
  payment: PaymentData;
}

export interface UsersData {
  validUser: TestUser;
  invalidUser: InvalidUser;
}

class DataLoader {
  private static instance: DataLoader;
  private dataPath: string;

  private constructor() {
    // Use path to src/tests/inputData (from src/main/utils go up to src, then tests/inputData)
    this.dataPath = path.resolve(__dirname, '../../tests/inputData');
  }

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  private loadJson<T>(filename: string): T {
    const filePath = path.join(this.dataPath, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  getUsers(): UsersData {
    return this.loadJson<UsersData>('users.json');
  }

  getProducts(): ProductsData {
    return this.loadJson<ProductsData>('products.json');
  }

  getCheckout(): CheckoutData {
    return this.loadJson<CheckoutData>('checkout.json');
  }
}

export const dataLoader = DataLoader.getInstance();