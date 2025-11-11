import { describe, it, expect, beforeEach } from 'vitest';
import { BugSpotter } from '../../src/index';
import type { BugSpotterConfig } from '../../src/index';

describe('BugSpotter - URL Parsing Helpers', () => {
  let baseConfig: BugSpotterConfig;

  beforeEach(() => {
    baseConfig = {
      showWidget: false,
      auth: {
        type: 'api-key',
        apiKey: 'test-api-key',
        projectId: 'test-project-id',
      },
    };
  });

  describe('stripEndpointSuffix', () => {
    it('should strip /bugs suffix', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com/api/v1/bugs' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).stripEndpointSuffix('/api/v1/bugs');
      expect(result).toBe('/api/v1');
    });

    it('should strip /api/v1/reports path', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com/api/v1/reports' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).stripEndpointSuffix('/api/v1/reports');
      expect(result).toBe('');
    });

    it('should strip /api/v1/reports with additional segments', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).stripEndpointSuffix('/prefix/api/v1/reports/extra');
      expect(result).toBe('/prefix');
    });

    it('should remove trailing slash', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).stripEndpointSuffix('/api/v1/');
      expect(result).toBe('/api/v1');
    });

    it('should return empty string for root path', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).stripEndpointSuffix('/');
      expect(result).toBe('');
    });

    it('should handle path without special suffixes', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).stripEndpointSuffix('/api/v2/custom');
      expect(result).toBe('/api/v2/custom');
    });
  });

  describe('getApiBaseUrl', () => {
    it('should extract base URL from endpoint with /bugs suffix', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com/api/v1/bugs' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      expect(result).toBe('https://api.example.com/api/v1');
    });

    it('should extract base URL from endpoint with /api/v1/reports path', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com/api/v1/reports' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      expect(result).toBe('https://api.example.com');
    });

    it('should handle endpoint with custom port', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com:8443/api/v1/bugs' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      expect(result).toBe('https://api.example.com:8443/api/v1');
    });

    it('should handle endpoint with http protocol', () => {
      const config = { ...baseConfig, endpoint: 'http://localhost:3000/api/v1/reports' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      expect(result).toBe('http://localhost:3000');
    });

    it('should handle endpoint without trailing slash', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      expect(result).toBe('https://api.example.com');
    });

    it('should handle endpoint with nested paths', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com/v2/bugspotter/bugs' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      expect(result).toBe('https://api.example.com/v2/bugspotter');
    });

    it('should throw if endpoint is not configured', () => {
      const config = { ...baseConfig, endpoint: undefined };
      const bugSpotter = new BugSpotter(config);
      expect(() => (bugSpotter as any).getApiBaseUrl()).toThrow('No endpoint configured');
    });

    it('should handle invalid URL with fallback', () => {
      const config = { ...baseConfig, endpoint: 'not-a-valid-url/api/v1/bugs' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      // Fallback should strip /bugs suffix
      expect(result).toBe('not-a-valid-url/api/v1');
    });

    it('should handle endpoint with query parameters (edge case)', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com/api/v1/bugs?test=1' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      // URL.pathname excludes query parameters
      expect(result).toBe('https://api.example.com/api/v1');
    });

    it('should handle endpoint with fragment (edge case)', () => {
      const config = { ...baseConfig, endpoint: 'https://api.example.com/api/v1/bugs#section' };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      // URL.pathname excludes fragments
      expect(result).toBe('https://api.example.com/api/v1');
    });

    it('should preserve custom base path', () => {
      const config = {
        ...baseConfig,
        endpoint: 'https://api.example.com/custom/prefix/api/v1/reports',
      };
      const bugSpotter = new BugSpotter(config);
      const result = (bugSpotter as any).getApiBaseUrl();
      expect(result).toBe('https://api.example.com/custom/prefix');
    });
  });
});
