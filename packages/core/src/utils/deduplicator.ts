/**
 * Bug Report Deduplicator
 * Prevents duplicate submissions by tracking recent reports
 */

import { getLogger } from './logger';

const logger = getLogger();

/**
 * Configuration for deduplication
 */
export interface DeduplicationConfig {
  /** Time window for considering reports as duplicates (ms, default: 60000 = 1 minute) */
  windowMs?: number;
  /** Maximum number of recent reports to track (default: 100) */
  maxCacheSize?: number;
  /** Whether to enable deduplication (default: true) */
  enabled?: boolean;
}

/**
 * Represents a fingerprint of a bug report
 */
interface ReportFingerprint {
  timestamp: number;
}

/**
 * Create a simple hash from a string (djb2 algorithm)
 */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // Apply 32-bit conversion after shift to prevent overflow before addition
    hash = (((hash << 5) | 0) + hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36); // Convert to base36 string
}

/**
 * Helper to safely extract error signature from an error-like object
 */
function getErrorSignature(err: unknown): string {
  if (!err || typeof err !== 'object') {
    return '';
  }
  const errorObj = err as Record<string, unknown>;
  const message = typeof errorObj.message === 'string' ? errorObj.message : '';
  const stack = typeof errorObj.stack === 'string' ? errorObj.stack : '';
  return `${message}:${stack}`;
}

/**
 * Create a fingerprint from bug report data
 */
function createFingerprint(
  title: string,
  description: string,
  errorDetails?: unknown
): string {
  // Normalize strings (trim, lowercase)
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedDesc = description.trim().toLowerCase();

  // Include error stack/message if available
  let errorSignature = '';
  if (errorDetails) {
    if (Array.isArray(errorDetails)) {
      // Handle array of error strings or objects
      errorSignature = errorDetails
        .map((err) => (typeof err === 'string' ? err : getErrorSignature(err)))
        .join('|');
    } else if (typeof errorDetails === 'object') {
      // Handle single error object (backward compatibility)
      errorSignature = getErrorSignature(errorDetails);
    }
  }

  // Create composite string
  const composite = `${normalizedTitle}|${normalizedDesc}|${errorSignature}`;

  return simpleHash(composite);
}

/**
 * Deduplicator class to prevent duplicate bug report submissions
 */
export class BugReportDeduplicator {
  private recentReports: Map<string, ReportFingerprint> = new Map();
  private config: Required<DeduplicationConfig>;
  private cleanupInterval: number | null = null;
  private submittingFingerprints: Set<string> = new Set();

  constructor(config: DeduplicationConfig = {}) {
    this.config = {
      windowMs: config.windowMs !== undefined ? config.windowMs : 60000, // 1 minute default
      maxCacheSize:
        config.maxCacheSize !== undefined ? config.maxCacheSize : 100,
      enabled: config.enabled !== undefined ? config.enabled : true,
    };

    // Start periodic cleanup with error handling
    if (this.config.enabled && typeof window !== 'undefined') {
      this.cleanupInterval = window.setInterval(() => {
        try {
          this.cleanup();
        } catch (error) {
          logger.error('Deduplicator cleanup failed', error);
        }
      }, this.config.windowMs / 2);
    }
  }

  /**
   * Check if a submission is currently in progress for a specific report
   */
  isInProgress(
    title: string,
    description: string,
    errorDetails?: unknown
  ): boolean {
    const fingerprint = createFingerprint(title, description, errorDetails);
    return this.submittingFingerprints.has(fingerprint);
  }

  /**
   * Mark submission as in progress for a specific report
   */
  markInProgress(
    title: string,
    description: string,
    errorDetails?: unknown
  ): void {
    const fingerprint = createFingerprint(title, description, errorDetails);
    this.submittingFingerprints.add(fingerprint);
  }

  /**
   * Mark submission as complete for a specific report
   */
  markComplete(
    title: string,
    description: string,
    errorDetails?: unknown
  ): void {
    const fingerprint = createFingerprint(title, description, errorDetails);
    this.submittingFingerprints.delete(fingerprint);
  }

  /**
   * Check if a bug report is a duplicate of a recently submitted one
   * @returns true if duplicate, false if not
   */
  isDuplicate(
    title: string,
    description: string,
    errorDetails?: unknown
  ): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const fingerprint = createFingerprint(title, description, errorDetails);

    // Check if this specific report is already being submitted (double-click prevention)
    if (this.submittingFingerprints.has(fingerprint)) {
      logger.warn(
        'Duplicate submission blocked: this report is already in progress'
      );
      return true;
    }

    const now = Date.now();

    // Check if we've seen this report recently
    const recent = this.recentReports.get(fingerprint);
    if (recent && now - recent.timestamp < this.config.windowMs) {
      const ageSeconds = Math.round((now - recent.timestamp) / 1000);
      logger.warn(`Duplicate bug report detected (age: ${ageSeconds}s)`, {
        fingerprint,
        title: title.substring(0, 50),
      });
      return true;
    }

    return false;
  }

  /**
   * Record a bug report submission
   */
  recordSubmission(
    title: string,
    description: string,
    errorDetails?: unknown
  ): void {
    if (!this.config.enabled) {
      return;
    }

    const fingerprint = createFingerprint(title, description, errorDetails);
    const now = Date.now();

    // Enforce cache size limit with FIFO eviction BEFORE adding new entry
    // This prevents cache from temporarily growing beyond maxCacheSize
    if (this.recentReports.size >= this.config.maxCacheSize) {
      // Remove oldest entry (first inserted) to maintain maxCacheSize
      const firstKey = this.recentReports.keys().next().value;
      if (firstKey) {
        this.recentReports.delete(firstKey);
      }
    }

    this.recentReports.set(fingerprint, {
      timestamp: now,
    });

    logger.debug('Recorded bug report submission', {
      fingerprint,
      cacheSize: this.recentReports.size,
    });
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    this.recentReports.forEach((report, hash) => {
      if (now - report.timestamp > this.config.windowMs) {
        this.recentReports.delete(hash);
        removed++;
      }
    });

    if (removed > 0) {
      logger.debug(`Cleaned up ${removed} expired report fingerprints`);
    }
  }

  /**
   * Get current cache size (for testing)
   */
  getCacheSize(): number {
    return this.recentReports.size;
  }

  /**
   * Clear all cached reports
   */
  clear(): void {
    this.submittingFingerprints.clear();
    this.recentReports.clear();
    logger.debug('Cleared all cached report fingerprints');
  }

  /**
   * Destroy the deduplicator and stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}
