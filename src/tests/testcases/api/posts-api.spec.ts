import { test, expect } from '../../../main/fixtures/test-fixtures';

test.describe('API Tests - JSONPlaceholder', { tag: ['@regression'] }, () => {
    test('GET /posts returns a populated list', { tag: ['@regression'] },
        async ({ apiClient }) => {
            const result = await apiClient.get<Array<{ id: number; title: string; body: string }>>('/posts');

            expect(result.status).toBe(200);
            expect(result.body.length).toBeGreaterThan(0);
            expect(result.body[0]).toHaveProperty('id');
            expect(result.body[0]).toHaveProperty('title');
        });

    test('POST /posts creates a new resource', { tag: ['@regression'] },
        async ({ apiClient }) => {
            const payload = {
                title: 'Playwright API test',
                body: 'This is a sample API payload',
                userId: 1,
            };

            const result = await apiClient.post<{ id: number; title: string; body: string; userId: number }>('/posts', payload);

            expect(result.status).toBe(201);
            expect(result.body.title).toBe(payload.title);
            expect(result.body.userId).toBe(payload.userId);
            expect(result.body.id).toBeGreaterThan(0);
        });

    test('GET /posts/1 returns specific post', { tag: ['@regression'] },
        async ({ apiClient }) => {
            const result = await apiClient.get<{ id: number; title: string; body: string; userId: number }>('/posts/1');

            expect(result.status).toBe(200);
            expect(result.body.id).toBe(1);
            expect(result.body.title).toBeTruthy();
            expect(result.body.body).toBeTruthy();
        });

    test('PUT /posts/1 simulates update', { tag: ['@regression'] },
        async ({ apiClient }) => {
            const payload = {
                id: 1,
                title: 'Updated title',
                body: 'Updated body',
                userId: 1,
            };

            const result = await apiClient.put<{ id: number; title: string; body: string; userId: number }>('/posts/1', payload);

            expect([200, 201, 404]).toContain(result.status);
            if (result.status === 200) {
                expect(result.body.title).toBe(payload.title);
                expect(result.body.body).toBe(payload.body);
            }
        });

    test('PATCH /posts/1 partial update', { tag: ['@regression'] },
        async ({ apiClient }) => {
            const payload = {
                title: 'Partially updated title',
            };

            const result = await apiClient.patch<{ id: number; title: string; body: string; userId: number }>('/posts/1', payload);

            expect([200, 201, 404]).toContain(result.status);
            if (result.status === 200) {
                expect(result.body.title).toBe(payload.title);
            }
        });

    test('DELETE /posts/1 deletes resource', { tag: ['@regression'] },
        async ({ apiClient }) => {
            const result = await apiClient.delete<{ id: number }>('/posts/1');

            expect([200, 204, 404]).toContain(result.status);
        });
});
