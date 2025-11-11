import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthHeaders, submitWithAuth, type AuthConfig } from '../../src/core/transport';

const TEST_AUTH: AuthConfig = {
  type: 'api-key',
  apiKey: 'test-api-key-12345',
  projectId: 'proj-12345678-1234-1234-1234-123456789abc',
};

describe('Transport - Authentication', () => {
  describe('getAuthHeaders', () => {
    it('should handle api-key type', () => {
      const headers = getAuthHeaders(TEST_AUTH);
      expect(headers).toEqual({
        'X-API-Key': 'test-api-key-12345',
      });
    });

    it('should include projectId in auth config', () => {
      expect(TEST_AUTH.projectId).toBe('proj-12345678-1234-1234-1234-123456789abc');
    });
  });

  describe('submitWithAuth', () => {
    beforeEach(() => {
      // Reset fetch mock before each test
      global.fetch = vi.fn();
    });

    it('should submit with API key authentication', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const response = await submitWithAuth(
        'https://api.example.com/bugs',
        JSON.stringify({ test: 'data' }),
        { 'Content-Type': 'application/json' },
        { auth: TEST_AUTH }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/bugs',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key-12345',
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(response.status).toBe(200);
    });

    it('should throw error if auth apiKey is undefined', async () => {
      // TypeScript would catch this, but testing runtime behavior
      await expect(
        submitWithAuth(
          'https://api.example.com/bugs',
          JSON.stringify({ test: 'data' }),
          { 'Content-Type': 'application/json' },
          { type: 'api-key', projectId: 'test-proj', apiKey: undefined } as any
        )
      ).rejects.toThrow('Authentication is required: API key must be provided');
    });

    it('should include retry configuration', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
      });

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await submitWithAuth(
        'https://api.example.com/bugs',
        JSON.stringify({ test: 'data' }),
        { 'Content-Type': 'application/json' },
        {
          auth: TEST_AUTH,
          retry: {
            maxRetries: 3,
            baseDelay: 1000,
          },
        }
      );

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should include offline configuration', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
      });

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await submitWithAuth(
        'https://api.example.com/bugs',
        JSON.stringify({ test: 'data' }),
        { 'Content-Type': 'application/json' },
        {
          auth: TEST_AUTH,
          offline: {
            enabled: true,
            maxQueueSize: 10,
          },
        }
      );

      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
