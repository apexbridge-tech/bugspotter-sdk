/**
 * Configuration Validation Utilities
 * Validates BugSpotter configuration before use
 */

import type { AuthConfig } from '../core/transport';

export interface ValidationContext {
  endpoint?: string;
  auth?: AuthConfig;
}

/**
 * Validate authentication configuration
 * @throws Error if configuration is invalid
 */
export function validateAuthConfig(context: ValidationContext): void {
  if (!context.endpoint) {
    throw new Error('No endpoint configured for bug report submission');
  }

  if (!context.auth) {
    throw new Error('API key authentication is required');
  }

  if (context.auth.type !== 'api-key') {
    throw new Error('API key authentication is required');
  }

  if (!context.auth.apiKey) {
    throw new Error('API key is required in auth configuration');
  }

  if (!context.auth.projectId) {
    throw new Error('Project ID is required in auth configuration');
  }
}
