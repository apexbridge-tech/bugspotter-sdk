/**
 * URL Helper Utilities
 * Extract base API URL from endpoint configuration
 */

import { getLogger } from './logger';

const logger = getLogger();

/**
 * Custom error for invalid endpoint URLs
 */
export class InvalidEndpointError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly reason: string
  ) {
    super(`Invalid endpoint URL: ${endpoint}. ${reason}`);
    this.name = 'InvalidEndpointError';
  }
}

/**
 * Strip known endpoint suffixes from path
 * Removes /api/v1/reports path
 */
export function stripEndpointSuffix(path: string): string {
  // Use lastIndexOf to handle paths like '/prefix/api/v1/reports'
  const reportsIndex = path.lastIndexOf('/api/v1/reports');
  if (reportsIndex !== -1) {
    return path.substring(0, reportsIndex);
  }

  // Remove trailing slash
  return path.replace(/\/$/, '') || '';
}

/**
 * Extract base API URL from endpoint
 * Returns scheme + host + base path (without /api/v1/reports suffix)
 *
 * @example
 * getApiBaseUrl('https://api.example.com/api/v1/reports')
 * // Returns: 'https://api.example.com'
 *
 * @throws InvalidEndpointError if endpoint is not a valid absolute URL
 */
export function getApiBaseUrl(endpoint: string): string {
  if (!endpoint) {
    throw new InvalidEndpointError('', 'No endpoint configured');
  }

  try {
    const url = new URL(endpoint);
    const basePath = stripEndpointSuffix(url.pathname);
    return url.origin + basePath;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Invalid endpoint URL - must be a valid absolute URL', {
      endpoint,
      error: errorMessage,
    });
    throw new InvalidEndpointError(
      endpoint,
      'Must be a valid absolute URL (e.g., https://api.example.com/api/v1/reports)'
    );
  }
}

/**
 * specific error for insecure endpoints
 */
export class InsecureEndpointError extends Error {
  constructor(public readonly endpoint: string) {
    super(
      `Secure HTTPS connection required. Attempted to connect to insecure endpoint: "${endpoint}"`
    );
    this.name = 'InsecureEndpointError';
  }
}

/**
 * Checks if the endpoint uses the secure HTTPS protocol.
 * Uses the URL API for robust parsing.
 *
 * @param endpoint The endpoint URL to check
 * @returns True if the endpoint uses HTTPS
 */
export function isSecureEndpoint(endpoint: string): boolean {
  if (!endpoint) return false;
  try {
    const url = new URL(endpoint.trim());
    // STRICT SECURITY:
    // 1. Production must use HTTPS
    // 2. Development allowed on localhost/127.0.0.1 via HTTP

    return (
      url.protocol === 'https:' ||
      (url.protocol === 'http:' &&
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1'))
    );
  } catch {
    // If it's not a valid URL, it's definitely not a secure endpoint
    return false;
  }
}
