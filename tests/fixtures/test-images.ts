/**
 * Test image fixtures for SDK tests
 * Contains base64-encoded test images to avoid duplication across test files
 */

/**
 * 1x1 transparent PNG image (85 bytes)
 * Base64-encoded data URL for testing screenshot uploads
 */
export const TEST_SCREENSHOT_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Base64 part only (without data URL prefix)
 * Useful for tests that need raw base64 data
 */
export const TEST_SCREENSHOT_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
