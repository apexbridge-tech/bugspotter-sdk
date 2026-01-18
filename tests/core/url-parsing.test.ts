import { describe, it, expect } from 'vitest';
import {
  stripEndpointSuffix,
  getApiBaseUrl,
  InvalidEndpointError,
  isSecureEndpoint,
} from '../../src/utils/url-helpers';

describe('URL Helper Utilities', () => {
  describe('stripEndpointSuffix', () => {
    it('should strip /api/v1/reports path', () => {
      const result = stripEndpointSuffix('/api/v1/reports');
      expect(result).toBe('');
    });

    it('should strip /api/v1/reports with additional segments', () => {
      const result = stripEndpointSuffix('/prefix/api/v1/reports/extra');
      expect(result).toBe('/prefix');
    });

    it('should remove trailing slash', () => {
      const result = stripEndpointSuffix('/api/v1/');
      expect(result).toBe('/api/v1');
    });

    it('should return empty string for root path', () => {
      const result = stripEndpointSuffix('/');
      expect(result).toBe('');
    });

    it('should handle path without special suffixes', () => {
      const result = stripEndpointSuffix('/api/v2/custom');
      expect(result).toBe('/api/v2/custom');
    });
  });

  describe('getApiBaseUrl', () => {
    it('should extract base URL from endpoint with /api/v1/reports path', () => {
      const result = getApiBaseUrl('https://api.example.com/api/v1/reports');
      expect(result).toBe('https://api.example.com');
    });

    it('should handle endpoint with custom port', () => {
      const result = getApiBaseUrl(
        'https://api.example.com:8443/api/v1/reports'
      );
      expect(result).toBe('https://api.example.com:8443');
    });

    it('should handle endpoint with http protocol', () => {
      const result = getApiBaseUrl('http://localhost:3000/api/v1/reports');
      expect(result).toBe('http://localhost:3000');
    });

    it('should handle endpoint without trailing slash', () => {
      const result = getApiBaseUrl('https://api.example.com');
      expect(result).toBe('https://api.example.com');
    });

    it('should throw InvalidEndpointError if endpoint is not configured', () => {
      expect(() => getApiBaseUrl('')).toThrow(InvalidEndpointError);
      expect(() => getApiBaseUrl('')).toThrow('No endpoint configured');
    });

    it('should throw InvalidEndpointError for invalid URL', () => {
      const invalidUrl = 'not-a-valid-url/api/v1/reports';

      try {
        getApiBaseUrl(invalidUrl);
        expect.fail('Should have thrown InvalidEndpointError');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidEndpointError);
        expect(error).toHaveProperty('endpoint', invalidUrl);
        expect(error).toHaveProperty('reason');
        expect((error as InvalidEndpointError).message).toContain(
          'Invalid endpoint URL'
        );
        expect((error as InvalidEndpointError).message).toContain(
          'Must be a valid absolute URL'
        );
      }
    });

    it('should throw InvalidEndpointError for relative URLs', () => {
      expect(() => getApiBaseUrl('/api/v1/reports')).toThrow(
        InvalidEndpointError
      );
      expect(() => getApiBaseUrl('/api/v1/reports')).toThrow(
        'Must be a valid absolute URL'
      );
    });

    it('should throw InvalidEndpointError for protocol-relative URLs', () => {
      expect(() => getApiBaseUrl('//api.example.com/api/v1/reports')).toThrow(
        InvalidEndpointError
      );
    });

    it('should handle endpoint with query parameters (edge case)', () => {
      const result = getApiBaseUrl(
        'https://api.example.com/api/v1/reports?test=1'
      );
      // URL.pathname excludes query parameters
      expect(result).toBe('https://api.example.com');
    });

    it('should handle endpoint with fragment (edge case)', () => {
      const result = getApiBaseUrl(
        'https://api.example.com/api/v1/reports#section'
      );
      // URL.pathname excludes fragments
      expect(result).toBe('https://api.example.com');
    });

    it('should preserve custom base path', () => {
      const result = getApiBaseUrl(
        'https://api.example.com/custom/prefix/api/v1/reports'
      );
      expect(result).toBe('https://api.example.com/custom/prefix');
    });
  });

  describe('isSecureEndpoint', () => {
    it('should return true for https URLs', () => {
      expect(isSecureEndpoint('https://api.example.com')).toBe(true);
      expect(isSecureEndpoint('https://localhost:3000')).toBe(true);
    });

    it('should return false for http URLs', () => {
      expect(isSecureEndpoint('http://api.example.com')).toBe(false);
      // localhost now allowed, so removing expectation for http://localhost:3000 to be false
    });

    it('should return false for other protocols', () => {
      expect(isSecureEndpoint('wss://api.example.com')).toBe(false);
      expect(isSecureEndpoint('ftp://api.example.com')).toBe(false);
      expect(isSecureEndpoint('file:///c:/test')).toBe(false);
    });

    it('should return true for localhost HTTP (development exception)', () => {
      expect(isSecureEndpoint('http://localhost:3000')).toBe(true);
      expect(isSecureEndpoint('http://127.0.0.1:8080')).toBe(true);
    });

    it('should return false for non-local HTTP', () => {
      expect(isSecureEndpoint('http://api.example.com')).toBe(false);
      expect(isSecureEndpoint('http://192.168.1.100')).toBe(false); // Local network is not localhost
    });

    it('should return false for malformed URLs', () => {
      expect(isSecureEndpoint('not-a-url')).toBe(false);
      expect(isSecureEndpoint('//missing-protocol')).toBe(false);
      expect(isSecureEndpoint('https:')).toBe(false);
    });

    it('should return false for empty or nullish inputs', () => {
      expect(isSecureEndpoint('')).toBe(false);
      // @ts-expect-error - Testing with invalid input type
      expect(isSecureEndpoint(null)).toBe(false);
      // @ts-expect-error - Testing with invalid input type
      expect(isSecureEndpoint(undefined)).toBe(false);
    });

    it('should handle URLs with mixed case protocol', () => {
      // URL.protocol normalizes to lowercase
      expect(isSecureEndpoint('HTtPs://api.example.com')).toBe(true);
    });

    it('should handle URLs with surrounding whitespace', () => {
      expect(isSecureEndpoint('  https://api.example.com  ')).toBe(true);
    });
  });
});
