import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateAuthConfig,
  ValidationContext,
} from '../../src/utils/config-validator';
import { submitWithAuth, AuthConfig } from '../../src/core/transport';
import { OfflineQueue } from '../../src/core/offline-queue';

describe('HTTPS Enforcement', () => {
  describe('validateAuthConfig', () => {
    it('should throw an error if endpoint uses http instead of https', () => {
      const context: ValidationContext = {
        endpoint: 'http://api.bugspotter.dev',
        auth: {
          type: 'api-key',
          apiKey: 'valid-key',
          projectId: 'pid-123',
        },
      };

      try {
        validateAuthConfig(context);
        expect.fail('Should have thrown an error for HTTP endpoint');
      } catch (error: any) {
        expect(error.message).toContain('HTTPS');
      }
    });

    it('should allow https endpoints', () => {
      const context: ValidationContext = {
        endpoint: 'https://api.bugspotter.dev',
        auth: {
          type: 'api-key',
          apiKey: 'valid-key',
          projectId: 'pid-123',
        },
      };

      expect(() => validateAuthConfig(context)).not.toThrow();
    });
  });

  describe('submitWithAuth', () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should reject requests to http endpoints at runtime', async () => {
      const endpoint = 'http://api.bugspotter.dev/report';
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: 'valid-key',
        projectId: 'pid-123',
      };

      await expect(
        submitWithAuth(endpoint, '{}', {}, { auth })
      ).rejects.toThrow(/HTTPS/);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should allow requests to https endpoints', async () => {
      const endpoint = 'https://api.bugspotter.dev/report';
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: 'valid-key',
        projectId: 'pid-123',
      };

      await expect(
        submitWithAuth(endpoint, '{}', {}, { auth })
      ).resolves.not.toThrow();

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('OfflineQueue', () => {
    it('should drop queued requests with http endpoints', async () => {
      // Mock StorageAdapter
      const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };

      // Mock queued item with HTTP
      const queuedItem = [
        {
          id: 'req_123',
          endpoint: 'http://api.bugspotter.dev/report', // HTTP
          body: '{}',
          headers: {},
          timestamp: Date.now(),
          attempts: 0,
        },
      ];

      mockStorage.getItem.mockReturnValue(JSON.stringify(queuedItem));

      const queue = new OfflineQueue({ enabled: true }, undefined, mockStorage);

      // Spy on fetch
      global.fetch = vi.fn();

      await queue.processWithAuth([], { 'X-API-Key': 'key' });

      // Should not call fetch for http endpoint
      expect(global.fetch).not.toHaveBeenCalled();

      // Should save queue (removing the invalid item)
      expect(mockStorage.setItem).toHaveBeenCalled();
      const savedQueue = JSON.parse(mockStorage.setItem.mock.calls[0][1]);
      // If code works as intended (treating as non-retryable failure), it should be removed
      expect(savedQueue).toHaveLength(0);
    });
  });
});
