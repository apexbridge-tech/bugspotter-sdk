import { vi } from 'vitest';

/**
 * Configuration for custom fetch mock behavior
 */
export interface FetchMockConfig {
  /** Mock function for API calls (optional, defaults to successful response) */
  apiMock?: ReturnType<typeof vi.fn>;
  /** Include presigned URLs in API responses (default: true) */
  includePresignedUrls?: boolean;
  /** Bug ID to return in API responses (default: 'test-bug-id') */
  bugId?: string;
  /** Simulate successful S3 uploads (default: true, set to false for failure testing) */
  s3UploadSuccess?: boolean;
  /** Pass S3 uploads through to apiMock for counting (default: false) */
  passS3ToApiMock?: boolean;
}

/**
 * Create a custom fetch mock that handles:
 * - Data URLs (for screenshot blob conversion)
 * - S3 presigned URL uploads (simulated success)
 * - Regular API calls (configurable via apiMock parameter)
 *
 * @param config - Configuration for mock behavior
 * @returns Configured fetch mock function
 *
 * @example
 * ```typescript
 * const apiMock = vi.fn();
 * const fetchMock = createFetchMock({ apiMock });
 * global.fetch = fetchMock;
 * ```
 */
export function createFetchMock(
  config: FetchMockConfig = {}
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Partial<Response>> {
  const {
    apiMock,
    includePresignedUrls = true,
    bugId = 'test-bug-id',
    s3UploadSuccess = true,
    passS3ToApiMock = false,
  } = config;

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Handle data URLs (for screenshot blob conversion)
    if (url.startsWith('data:')) {
      const base64Data = url.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });
      return {
        blob: async () => blob,
      };
    }

    // Handle S3 presigned URL uploads
    if (url.includes('s3.example.com') || url.includes('s3.amazonaws.com')) {
      // Pass S3 requests to apiMock if configured (for call counting in tests)
      if (passS3ToApiMock && apiMock) {
        return apiMock(input, init);
      }

      // Otherwise return direct response
      return Promise.resolve({
        ok: s3UploadSuccess,
        status: s3UploadSuccess ? 200 : 500,
      });
    }

    // Handle regular API calls
    if (apiMock) {
      return apiMock(input, init);
    }

    // Default successful API response
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: bugId,
          title: 'Test Bug',
          status: 'open',
          created_at: new Date().toISOString(),
          ...(includePresignedUrls && {
            presignedUrls: {
              screenshot: {
                uploadUrl: 'https://s3.example.com/presigned-screenshot',
                storageKey: 'screenshots/test-key',
              },
              replay: {
                uploadUrl: 'https://s3.example.com/presigned-replay',
                storageKey: 'replays/test-key',
              },
            },
          }),
        },
      }),
    };
  };
}

/**
 * Create a simple fetch mock with default successful responses
 * Convenience wrapper around createFetchMock with no configuration
 *
 * @example
 * ```typescript
 * global.fetch = createSimpleFetchMock();
 * ```
 */
export function createSimpleFetchMock(): (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Partial<Response>> {
  return createFetchMock();
}
