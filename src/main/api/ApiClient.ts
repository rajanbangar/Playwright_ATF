import { request, type APIRequestContext } from '@playwright/test';

export class ApiClient {
    constructor(
        private readonly requestContext: APIRequestContext,
        private readonly baseURL: string,
    ) { }

    static async create(baseURL: string) {
        const requestContext = await request.newContext({
            baseURL,
            extraHTTPHeaders: {
                Accept: 'application/json',
            },
        });

        return new ApiClient(requestContext, baseURL);
    }

    async get<T>(path: string, headers?: Record<string, string>) {
        const response = await this.requestContext.get(path, { headers });

        return {
            status: response.status(),
            body: (await response.json()) as T,
            response,
        };
    }

    async post<T>(path: string, data: unknown, headers?: Record<string, string>) {
        const response = await this.requestContext.post(path, {
            data,
            headers,
        });

        return {
            status: response.status(),
            body: (await response.json()) as T,
            response,
        };
    }

    async close() {
        await this.requestContext.dispose();
    }
}
