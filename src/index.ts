import { ScreenshotCapture } from './capture/screenshot';
import { ConsoleCapture } from './capture/console';
import { NetworkCapture } from './capture/network';
import { MetadataCapture } from './capture/metadata';
import type { BrowserMetadata } from './capture/metadata';
import { FloatingButton, type FloatingButtonOptions } from './widget/button';
import { BugReportModal } from './widget/modal';
import { DOMCollector } from './collectors';
import type { eventWithTime } from '@rrweb/types';
import { createSanitizer, type Sanitizer } from './utils/sanitize';
import { getLogger } from './utils/logger';
import { submitWithAuth, type AuthConfig, type RetryConfig } from './core/transport';
import type { OfflineConfig } from './core/offline-queue';
import { FileUploadHandler } from './core/file-upload-handler';
import { DEFAULT_REPLAY_DURATION_SECONDS } from './constants';

const logger = getLogger();

export class BugSpotter {
  private static instance: BugSpotter | undefined;

  private config: BugSpotterConfig;
  private screenshot: ScreenshotCapture;
  private console: ConsoleCapture;
  private network: NetworkCapture;
  private metadata: MetadataCapture;
  private domCollector?: DOMCollector;
  private widget?: FloatingButton;
  private sanitizer?: Sanitizer;

  constructor(config: BugSpotterConfig) {
    this.config = config;

    // Initialize sanitizer if enabled
    if (config.sanitize?.enabled !== false) {
      this.sanitizer = createSanitizer({
        enabled: config.sanitize?.enabled ?? true,
        patterns: config.sanitize?.patterns,
        customPatterns: config.sanitize?.customPatterns,
        excludeSelectors: config.sanitize?.excludeSelectors,
      });
    }

    this.screenshot = new ScreenshotCapture();
    this.console = new ConsoleCapture({ sanitizer: this.sanitizer });
    this.network = new NetworkCapture({ sanitizer: this.sanitizer });
    this.metadata = new MetadataCapture({ sanitizer: this.sanitizer });

    // Note: DirectUploader is created per-report since it needs bugId
    // See submitBugReport() for initialization

    // Initialize DOM collector if replay is enabled
    if (config.replay?.enabled !== false) {
      this.domCollector = new DOMCollector({
        duration: config.replay?.duration ?? DEFAULT_REPLAY_DURATION_SECONDS,
        sampling: config.replay?.sampling,
        sanitizer: this.sanitizer,
      });
      this.domCollector.startRecording();
    }

    // Initialize widget if enabled
    if (config.showWidget !== false) {
      this.widget = new FloatingButton(config.widgetOptions);
      this.widget.onClick(async () => {
        await this.handleBugReport();
      });
    }
  }

  static init(config: BugSpotterConfig): BugSpotter {
    if (!BugSpotter.instance) {
      BugSpotter.instance = new BugSpotter(config);
    }
    return BugSpotter.instance;
  }

  static getInstance(): BugSpotter | null {
    return BugSpotter.instance || null;
  }

  /**
   * Capture bug report data
   * Note: Screenshot is captured for modal preview only (_screenshotPreview)
   * Actual file uploads use presigned URLs (screenshotKey/replayKey set after upload)
   */
  async capture(): Promise<BugReport> {
    const screenshotPreview = await this.screenshot.capture();
    const replayEvents = this.domCollector?.getEvents() ?? [];

    return {
      console: this.console.getLogs(),
      network: this.network.getRequests(),
      metadata: this.metadata.capture(),
      replay: replayEvents,
      // Internal: screenshot preview for modal (not sent to API)
      _screenshotPreview: screenshotPreview,
    };
  }

  private async handleBugReport(): Promise<void> {
    const report = await this.capture();

    const modal = new BugReportModal({
      onSubmit: async (data) => {
        logger.log('Submitting bug:', { ...data, report });

        // Send to endpoint if configured
        if (this.config.endpoint) {
          try {
            await this.submitBugReport({ ...data, report });
            logger.log('Bug report submitted successfully');
          } catch (error) {
            logger.error('Failed to submit bug report:', error);
            // Re-throw to allow UI to handle errors if needed
            throw error;
          }
        }
      },
    });

    modal.show(report._screenshotPreview || '');
  }

  /**
   * Validate authentication configuration
   * @throws Error if configuration is invalid
   */
  private validateAuthConfig(): void {
    if (!this.config.endpoint) {
      throw new Error('No endpoint configured for bug report submission');
    }
    if (!this.config.auth) {
      throw new Error('API key authentication is required');
    }
    if (this.config.auth.type !== 'api-key') {
      throw new Error('API key authentication is required');
    }
    if (!this.config.auth.apiKey) {
      throw new Error('API key is required in auth configuration');
    }
    if (!this.config.auth.projectId) {
      throw new Error('Project ID is required in auth configuration');
    }
  }

  /**
   * Strip endpoint suffix from path
   */
  private stripEndpointSuffix(path: string): string {
    if (path.endsWith('/bugs')) {
      return path.slice(0, -5);
    } else if (path.includes('/api/v1/reports')) {
      return path.substring(0, path.indexOf('/api/v1/reports'));
    }
    return path.replace(/\/$/, '') || '';
  }

  /**
   * Get the base API URL for confirm-upload calls
   * Extracts scheme, host, and base path from the configured endpoint
   */
  private getApiBaseUrl(): string {
    if (!this.config.endpoint) {
      throw new Error('No endpoint configured');
    }

    try {
      const url = new URL(this.config.endpoint);
      const basePath = this.stripEndpointSuffix(url.pathname);
      return url.origin + basePath;
    } catch (error) {
      // Fallback for invalid URLs
      logger.warn('Failed to parse endpoint URL, using fallback', {
        endpoint: this.config.endpoint,
        error: error instanceof Error ? error.message : String(error),
      });
      return this.stripEndpointSuffix(this.config.endpoint);
    }
  }

  private async submitBugReport(payload: BugReportPayload): Promise<void> {
    this.validateAuthConfig();

    logger.warn(`Submitting bug report to ${this.config.endpoint}`);

    // Step 1: Create bug report and request presigned URLs
    const { report, ...metadata } = payload;

    // Check what files we need to upload
    const hasScreenshot = !!(
      report._screenshotPreview && report._screenshotPreview.startsWith('data:image/')
    );
    const hasReplay = !!(report.replay && report.replay.length > 0);

    const createPayload = {
      ...metadata,
      report: {
        console: report.console,
        network: report.network,
        metadata: report.metadata,
        // Don't send replay events or screenshot in initial request
      },
      // Tell backend we have files so it can generate presigned URLs
      hasScreenshot,
      hasReplay,
    };

    const contentHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const response = await submitWithAuth(
      this.config.endpoint!, // Validated in validateAuthConfig
      JSON.stringify(createPayload),
      contentHeaders,
      {
        auth: this.config.auth,
        retry: this.config.retry,
        offline: this.config.offline,
      }
    );

    logger.warn(`${JSON.stringify(response)}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Failed to submit bug report: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    const result = await response.json().catch(() => ({ success: false }));

    if (!result.success || !result.data?.id) {
      throw new Error('Bug report ID not returned from server');
    }

    const bugId = result.data.id;

    // Step 2: Upload screenshot and replay using presigned URLs from response
    if (!hasScreenshot && !hasReplay) {
      return; // No files to upload, nothing more to do
    }

    // Use FileUploadHandler to handle all file upload operations
    const apiEndpoint = this.getApiBaseUrl();
    const uploadHandler = new FileUploadHandler(apiEndpoint, this.config.auth.apiKey);

    await uploadHandler.uploadFiles(bugId, report, result.data.presignedUrls);
  }

  getConfig(): Readonly<BugSpotterConfig> {
    return { ...this.config };
  }

  destroy(): void {
    this.console.destroy();
    this.network.destroy();
    this.domCollector?.destroy();
    this.widget?.destroy();
    BugSpotter.instance = undefined;
  }
}

export interface BugSpotterConfig {
  endpoint?: string;
  showWidget?: boolean;
  widgetOptions?: FloatingButtonOptions;

  /**
   * Authentication configuration (required)
   * API key authentication with project ID
   */
  auth: AuthConfig;

  /** Retry configuration for failed requests */
  retry?: RetryConfig;

  /** Offline queue configuration */
  offline?: OfflineConfig;

  replay?: {
    /** Enable session replay recording (default: true) */
    enabled?: boolean;
    /** Duration in seconds to keep replay events (default: 15, max recommended: 30) */
    duration?: number;
    /** Sampling configuration for performance optimization */
    sampling?: {
      /** Throttle mousemove events in milliseconds (default: 50) */
      mousemove?: number;
      /** Throttle scroll events in milliseconds (default: 100) */
      scroll?: number;
    };
  };
  sanitize?: {
    /** Enable PII sanitization (default: true) */
    enabled?: boolean;
    /**
     * PII patterns to detect and mask
     * - Can be a preset name: 'all', 'minimal', 'financial', 'contact', 'gdpr', 'pci', etc.
     * - Or an array of pattern names: ['email', 'phone', 'ip']
     */
    patterns?:
      | 'all'
      | 'minimal'
      | 'financial'
      | 'contact'
      | 'identification'
      | 'kazakhstan'
      | 'gdpr'
      | 'pci'
      | Array<'email' | 'phone' | 'creditcard' | 'ssn' | 'iin' | 'ip' | 'custom'>;
    /** Custom regex patterns for PII detection */
    customPatterns?: Array<{
      name: string;
      regex: RegExp;
      description?: string;
      examples?: string[];
      priority?: number;
    }>;
    /** CSS selectors to exclude from sanitization */
    excludeSelectors?: string[];
  };
}

export interface BugReportPayload {
  title: string;
  description: string;
  report: BugReport;
}

export interface BugReport {
  screenshotKey?: string; // Presigned URL flow - storage key after upload
  console: Array<{
    level: string;
    message: string;
    timestamp: number;
    stack?: string;
  }>;
  network: Array<{
    url: string;
    method: string;
    status: number;
    duration: number;
    timestamp: number;
    error?: string;
  }>;
  metadata: BrowserMetadata;
  replay?: eventWithTime[]; // Inline events for immediate preview/processing
  replayKey?: string; // Presigned URL flow - storage key after upload
  _screenshotPreview?: string; // Internal: screenshot preview for modal (not sent to API)
}

// Export capture module types for advanced usage
export type { BrowserMetadata } from './capture/metadata';
export { ScreenshotCapture } from './capture/screenshot';
export { ConsoleCapture } from './capture/console';
export { NetworkCapture } from './capture/network';
export { MetadataCapture } from './capture/metadata';

// Export collector modules
export { DOMCollector } from './collectors';
export type { DOMCollectorConfig } from './collectors';

// Export core utilities
export { CircularBuffer } from './core/buffer';
export type { CircularBufferConfig } from './core/buffer';

// Export compression utilities
export {
  compressData,
  decompressData,
  compressImage,
  estimateSize,
  getCompressionRatio,
} from './core/compress';

// Export transport and authentication
export { submitWithAuth, getAuthHeaders, clearOfflineQueue } from './core/transport';
export type { AuthConfig, TransportOptions, RetryConfig } from './core/transport';
export type { OfflineConfig } from './core/offline-queue';
export type { Logger, LogLevel, LoggerConfig } from './utils/logger';
export { getLogger, configureLogger, createLogger } from './utils/logger';

// Export upload utilities
export { DirectUploader } from './core/uploader';
export type { UploadResult } from './core/uploader';
export {
  compressReplayEvents,
  canvasToBlob,
  estimateCompressedReplaySize,
  isWithinSizeLimit,
} from './core/upload-helpers';

// Export sanitization utilities
export { createSanitizer, Sanitizer } from './utils/sanitize';
export type { PIIPattern, CustomPattern, SanitizeConfig } from './utils/sanitize';

// Export pattern configuration utilities
export {
  DEFAULT_PATTERNS,
  PATTERN_PRESETS,
  PATTERN_CATEGORIES,
  PatternBuilder,
  createPatternConfig,
  getPattern,
  getPatternsByCategory,
  validatePattern,
} from './utils/sanitize';
export type { PIIPatternName, PatternDefinition } from './utils/sanitize';

// Export widget components
export { FloatingButton } from './widget/button';
export type { FloatingButtonOptions } from './widget/button';
export { BugReportModal } from './widget/modal';
export type { BugReportData, BugReportModalOptions, PIIDetection } from './widget/modal';

// Re-export rrweb types for convenience
export type { eventWithTime } from '@rrweb/types';

// Export constants
export {
  DEFAULT_REPLAY_DURATION_SECONDS,
  MAX_RECOMMENDED_REPLAY_DURATION_SECONDS,
} from './constants';

/**
 * Convenience function to sanitize text with default PII patterns
 * Useful for quick sanitization without creating a Sanitizer instance
 *
 * @param text - Text to sanitize
 * @returns Sanitized text with PII redacted
 *
 * @example
 * ```typescript
 * const sanitized = sanitize('Email: user@example.com');
 * // Returns: 'Email: [REDACTED]'
 * ```
 */
export function sanitize(text: string): string {
  const sanitizer = createSanitizer({
    enabled: true,
    patterns: 'all',
    customPatterns: [],
    excludeSelectors: [],
  });
  return sanitizer.sanitize(text) as string;
}
