/**
 * Unit tests for OfflineQueue class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  OfflineQueue,
  type OfflineConfig,
  type StorageAdapter,
} from '../../src/core/offline-queue';

// Mock storage adapter for testing
class MockStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

describe('OfflineQueue', () => {
  let storage: MockStorageAdapter;
  let config: OfflineConfig;

  beforeEach(() => {
    storage = new MockStorageAdapter();
    config = {
      enabled: true,
      maxQueueSize: 10,
    };
  });

  afterEach(() => {
    storage.clear();
  });

  describe('Security: Header Stripping', () => {
    it('should strip X-API-Key header before storing', () => {
      const queue = new OfflineQueue(config, undefined, storage);

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
          'X-API-Key': 'secret-key-12345',
        }
      );

      const stored = storage.getItem('bugspotter_offline_queue');
      expect(stored).toBeTruthy();

      const queueData = JSON.parse(stored!);
      expect(queueData).toHaveLength(1);
      expect(queueData[0].headers['Content-Type']).toBe('application/json');
      expect(queueData[0].headers['X-API-Key']).toBeUndefined();
    });

    it('should strip authorization header before storing', () => {
      const queue = new OfflineQueue(config, undefined, storage);

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        }
      );

      const stored = storage.getItem('bugspotter_offline_queue');
      const queueData = JSON.parse(stored!);
      expect(queueData[0].headers['Authorization']).toBeUndefined();
      expect(queueData[0].headers['authorization']).toBeUndefined();
    });

    it('should strip x-auth-token header before storing', () => {
      const queue = new OfflineQueue(config, undefined, storage);

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
          'X-Auth-Token': 'secret-token',
        }
      );

      const stored = storage.getItem('bugspotter_offline_queue');
      const queueData = JSON.parse(stored!);
      expect(queueData[0].headers['X-Auth-Token']).toBeUndefined();
      expect(queueData[0].headers['x-auth-token']).toBeUndefined();
    });

    it('should strip x-access-token header before storing', () => {
      const queue = new OfflineQueue(config, undefined, storage);

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
          'X-Access-Token': 'access-token',
        }
      );

      const stored = storage.getItem('bugspotter_offline_queue');
      const queueData = JSON.parse(stored!);
      expect(queueData[0].headers['X-Access-Token']).toBeUndefined();
      expect(queueData[0].headers['x-access-token']).toBeUndefined();
    });

    it('should strip cookie header before storing', () => {
      const queue = new OfflineQueue(config, undefined, storage);

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
          Cookie: 'sessionId=abc123',
        }
      );

      const stored = storage.getItem('bugspotter_offline_queue');
      const queueData = JSON.parse(stored!);
      expect(queueData[0].headers['Cookie']).toBeUndefined();
      expect(queueData[0].headers['cookie']).toBeUndefined();
    });

    it('should strip set-cookie header before storing', () => {
      const queue = new OfflineQueue(config, undefined, storage);

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
          'Set-Cookie': 'sessionId=abc123',
        }
      );

      const stored = storage.getItem('bugspotter_offline_queue');
      const queueData = JSON.parse(stored!);
      expect(queueData[0].headers['Set-Cookie']).toBeUndefined();
      expect(queueData[0].headers['set-cookie']).toBeUndefined();
    });

    it('should strip all sensitive headers while preserving safe headers', () => {
      const queue = new OfflineQueue(config, undefined, storage);

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
          'X-API-Key': 'secret',
          Authorization: 'Bearer token',
          'X-Auth-Token': 'auth-token',
          'X-Access-Token': 'access-token',
          Cookie: 'session=123',
          'Set-Cookie': 'session=456',
          'X-Request-ID': 'req-123',
          'User-Agent': 'TestAgent/1.0',
        }
      );

      const stored = storage.getItem('bugspotter_offline_queue');
      const queueData = JSON.parse(stored!);
      const headers = queueData[0].headers;

      // Safe headers should be preserved
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Request-ID']).toBe('req-123');
      expect(headers['User-Agent']).toBe('TestAgent/1.0');

      // Sensitive headers should be stripped
      expect(headers['X-API-Key']).toBeUndefined();
      expect(headers['Authorization']).toBeUndefined();
      expect(headers['X-Auth-Token']).toBeUndefined();
      expect(headers['X-Access-Token']).toBeUndefined();
      expect(headers['Cookie']).toBeUndefined();
      expect(headers['Set-Cookie']).toBeUndefined();
    });

    it('should handle case-insensitive header names', () => {
      const queue = new OfflineQueue(config, undefined, storage);

      // Test various case variations
      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test1' }),
        {
          'x-api-key': 'lowercase',
        }
      );

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test2' }),
        {
          'X-API-KEY': 'UPPERCASE',
        }
      );

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test3' }),
        {
          'X-Api-Key': 'MixedCase',
        }
      );

      const stored = storage.getItem('bugspotter_offline_queue');
      const queueData = JSON.parse(stored!);

      // All variations should be stripped
      expect(queueData[0].headers['x-api-key']).toBeUndefined();
      expect(queueData[1].headers['X-API-KEY']).toBeUndefined();
      expect(queueData[2].headers['X-Api-Key']).toBeUndefined();
    });
  });

  describe('processWithAuth', () => {
    it('should merge auth headers when processing queue', async () => {
      const queue = new OfflineQueue(config, undefined, storage);

      // Queue a request without auth headers (they were stripped)
      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
        }
      );

      // Mock fetch to capture headers
      let capturedHeaders: Record<string, string> = {};
      global.fetch = vi.fn((_url, options) => {
        if (options?.headers) {
          capturedHeaders = options.headers as Record<string, string>;
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
        } as Response);
      });

      // Process with auth headers
      await queue.processWithAuth([], {
        'X-API-Key': 'test-key-123',
      });

      // Verify auth headers were added
      expect(capturedHeaders['X-API-Key']).toBe('test-key-123');
      expect(capturedHeaders['Content-Type']).toBe('application/json');
    });

    it('should work with empty auth headers object', async () => {
      const queue = new OfflineQueue(config, undefined, storage);

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
        }
      );

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
        } as Response)
      );

      // Should not throw error with empty auth headers
      await expect(queue.processWithAuth([], {})).resolves.not.toThrow();
    });
  });

  describe('Backward Compatibility', () => {
    it('should support deprecated process() method', async () => {
      const queue = new OfflineQueue(config, undefined, storage);

      queue.enqueue(
        'https://api.example.com/test',
        JSON.stringify({ data: 'test' }),
        {
          'Content-Type': 'application/json',
        }
      );

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
        } as Response)
      );

      // Old process() method should still work
      await expect(queue.process([])).resolves.not.toThrow();
    });
  });
});
