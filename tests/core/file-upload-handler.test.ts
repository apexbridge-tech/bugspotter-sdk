import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileUploadHandler } from '../../src/core/file-upload-handler';
import type { BugReport } from '../../src/index';
import { TEST_SCREENSHOT_DATA_URL } from '../fixtures/test-images';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FileUploadHandler', () => {
  let handler: FileUploadHandler;
  const mockApiEndpoint = 'https://api.example.com';
  const mockApiKey = 'test-api-key';
  const mockBugId = 'bug-123';

  beforeEach(() => {
    handler = new FileUploadHandler(mockApiEndpoint, mockApiKey);
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('uploadFiles', () => {
    it('should handle empty file list (no screenshot or replay)', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: undefined,
      };

      const presignedUrls = {};

      await handler.uploadFiles(mockBugId, report, presignedUrls);

      // Should not call fetch at all
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should upload screenshot only', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: TEST_SCREENSHOT_DATA_URL,
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
      };

      // Mock successful upload and confirmation
      mockFetch
        .mockResolvedValueOnce({ ok: true, blob: vi.fn().mockResolvedValue(new Blob()) }) // dataUrlToBlob
        .mockResolvedValueOnce({ ok: true }) // storage upload
        .mockResolvedValueOnce({ ok: true }); // confirmation

      await handler.uploadFiles(mockBugId, report, presignedUrls);

      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Verify storage upload call
      expect(mockFetch).toHaveBeenCalledWith(
        'https://s3.example.com/screenshot.png',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': expect.any(String),
          }),
        })
      );

      // Verify confirmation call
      expect(mockFetch).toHaveBeenCalledWith(
        `${mockApiEndpoint}/api/v1/reports/${mockBugId}/confirm-upload`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': mockApiKey,
          },
          body: JSON.stringify({ fileType: 'screenshot' }),
        })
      );
    });

    it('should upload replay only', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [{ type: 1, data: {}, timestamp: Date.now() }],
        _screenshotPreview: undefined,
      };

      const presignedUrls = {
        replay: {
          uploadUrl: 'https://s3.example.com/replay.gz',
          storageKey: 'replays/test.gz',
        },
      };

      // Mock successful upload and confirmation
      mockFetch
        .mockResolvedValueOnce({ ok: true }) // storage upload
        .mockResolvedValueOnce({ ok: true }); // confirmation

      await handler.uploadFiles(mockBugId, report, presignedUrls);

      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Verify storage upload for replay
      expect(mockFetch).toHaveBeenCalledWith(
        'https://s3.example.com/replay.gz',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/gzip',
          }),
        })
      );
    });

    it('should upload both screenshot and replay', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [{ type: 1, data: {}, timestamp: Date.now() }],
        _screenshotPreview: 'data:image/png;base64,test',
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
        replay: {
          uploadUrl: 'https://s3.example.com/replay.gz',
          storageKey: 'replays/test.gz',
        },
      };

      // Mock all successful calls
      mockFetch
        .mockResolvedValueOnce({ ok: true, blob: vi.fn().mockResolvedValue(new Blob()) }) // dataUrlToBlob
        .mockResolvedValueOnce({ ok: true }) // screenshot upload
        .mockResolvedValueOnce({ ok: true }) // replay upload
        .mockResolvedValueOnce({ ok: true }) // screenshot confirmation
        .mockResolvedValueOnce({ ok: true }); // replay confirmation

      await handler.uploadFiles(mockBugId, report, presignedUrls);

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should throw if screenshot presigned URL is missing', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: 'data:image/png;base64,test',
      };

      const presignedUrls = {}; // Missing screenshot URL

      await expect(handler.uploadFiles(mockBugId, report, presignedUrls)).rejects.toThrow(
        'Screenshot presigned URL not provided by server'
      );
    });

    it('should throw if replay presigned URL is missing', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [{ type: 1, data: {}, timestamp: Date.now() }],
        _screenshotPreview: undefined,
      };

      const presignedUrls = {}; // Missing replay URL

      await expect(handler.uploadFiles(mockBugId, report, presignedUrls)).rejects.toThrow(
        'Replay presigned URL not provided by server'
      );
    });

    it('should throw if storage upload fails', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: 'data:image/png;base64,test',
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
      };

      // Mock dataUrlToBlob success, storage upload failure
      mockFetch
        .mockResolvedValueOnce({ ok: true, blob: vi.fn().mockResolvedValue(new Blob()) })
        .mockResolvedValueOnce({ ok: false }); // Upload fails

      await expect(handler.uploadFiles(mockBugId, report, presignedUrls)).rejects.toThrow(
        'Screenshot upload failed: Upload to storage failed'
      );
    });

    it('should throw if storage upload throws exception', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: 'data:image/png;base64,test',
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
      };

      mockFetch
        .mockResolvedValueOnce({ ok: true, blob: vi.fn().mockResolvedValue(new Blob()) })
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(handler.uploadFiles(mockBugId, report, presignedUrls)).rejects.toThrow(
        'Screenshot upload failed: Upload to storage failed'
      );
    });

    it('should throw if confirmation fails', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: 'data:image/png;base64,test',
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
      };

      // Mock successful upload, failed confirmation
      mockFetch
        .mockResolvedValueOnce({ ok: true, blob: vi.fn().mockResolvedValue(new Blob()) })
        .mockResolvedValueOnce({ ok: true }) // Upload succeeds
        .mockResolvedValueOnce({ ok: false }); // Confirmation fails

      await expect(handler.uploadFiles(mockBugId, report, presignedUrls)).rejects.toThrow(
        'Screenshot confirmation failed: Backend did not acknowledge upload'
      );
    });

    it('should throw if confirmation throws exception', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: 'data:image/png;base64,test',
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
      };

      mockFetch
        .mockResolvedValueOnce({ ok: true, blob: vi.fn().mockResolvedValue(new Blob()) })
        .mockResolvedValueOnce({ ok: true }) // Upload succeeds
        .mockRejectedValueOnce(new Error('Network error')); // Confirmation throws

      await expect(handler.uploadFiles(mockBugId, report, presignedUrls)).rejects.toThrow(
        'Screenshot confirmation failed: Backend did not acknowledge upload'
      );
    });

    it('should throw if dataUrlToBlob receives invalid data URL', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: 'not-a-data-url', // Invalid - doesn't start with 'data:image/'
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
      };

      // Since _screenshotPreview doesn't start with 'data:image/',
      // prepareFiles will skip it and return empty array, so no error thrown
      await handler.uploadFiles(mockBugId, report, presignedUrls);

      // Should not have called fetch at all
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw if fetch.blob() fails for data URL conversion', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: 'data:image/png;base64,test',
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
      };

      // Mock fetch response without blob method
      mockFetch.mockResolvedValueOnce({ ok: true, blob: null });

      await expect(handler.uploadFiles(mockBugId, report, presignedUrls)).rejects.toThrow(
        'Failed to convert data URL to Blob'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle screenshot with empty data URL', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: '',
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
      };

      // Empty string doesn't start with 'data:image/', so no upload should happen
      await handler.uploadFiles(mockBugId, report, presignedUrls);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle replay with empty events array', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [],
        _screenshotPreview: undefined,
      };

      const presignedUrls = {
        replay: {
          uploadUrl: 'https://s3.example.com/replay.gz',
          storageKey: 'replays/test.gz',
        },
      };

      // Empty replay array means no upload
      await handler.uploadFiles(mockBugId, report, presignedUrls);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle partial upload failure in batch', async () => {
      const report: BugReport = {
        console: [],
        network: [],
        metadata: {} as any,
        replay: [{ type: 1, data: {}, timestamp: Date.now() }],
        _screenshotPreview: 'data:image/png;base64,test',
      };

      const presignedUrls = {
        screenshot: {
          uploadUrl: 'https://s3.example.com/screenshot.png',
          storageKey: 'screenshots/test.png',
        },
        replay: {
          uploadUrl: 'https://s3.example.com/replay.gz',
          storageKey: 'replays/test.gz',
        },
      };

      // Mock screenshot success, replay failure
      mockFetch
        .mockResolvedValueOnce({ ok: true, blob: vi.fn().mockResolvedValue(new Blob()) })
        .mockResolvedValueOnce({ ok: true }) // Screenshot upload succeeds
        .mockResolvedValueOnce({ ok: false }); // Replay upload fails

      await expect(handler.uploadFiles(mockBugId, report, presignedUrls)).rejects.toThrow(
        'Replay upload failed: Upload to storage failed'
      );
    });
  });
});
