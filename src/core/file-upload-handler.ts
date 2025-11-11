import { compressData } from './compress';
import { getLogger } from '../utils/logger';
import type { BugReport } from '../index';

const logger = getLogger();

export interface PresignedUrlData {
  uploadUrl: string;
  storageKey: string;
}

export interface FileToUpload {
  type: 'screenshot' | 'replay';
  url: string;
  key: string;
  blob: Blob;
}

export interface UploadConfirmation {
  success: boolean;
  type: 'screenshot' | 'replay';
}

/**
 * Handles file upload operations using presigned URLs
 * Separates concerns: preparation → upload → confirmation
 *
 * @remarks
 * Upload timeout is set to 60 seconds (UPLOAD_TIMEOUT_MS).
 * This timeout applies to individual file uploads to S3.
 */
export class FileUploadHandler {
  private static readonly UPLOAD_TIMEOUT_MS = 60000; // 60 seconds

  constructor(
    private readonly apiEndpoint: string,
    private readonly apiKey: string
  ) {}

  /**
   * Orchestrates the complete file upload flow
   * @throws Error if any step fails
   */
  async uploadFiles(
    bugId: string,
    report: BugReport,
    presignedUrls: { screenshot?: PresignedUrlData; replay?: PresignedUrlData }
  ): Promise<void> {
    const filesToUpload = await this.prepareFiles(report, presignedUrls);

    if (filesToUpload.length === 0) {
      return; // No files to upload
    }

    await this.uploadToStorage(filesToUpload);
    await this.confirmUploads(filesToUpload, bugId);
  }

  /**
   * Prepare file blobs and validate presigned URLs
   */
  private async prepareFiles(
    report: BugReport,
    presignedUrls: { screenshot?: PresignedUrlData; replay?: PresignedUrlData }
  ): Promise<FileToUpload[]> {
    const files: FileToUpload[] = [];

    // Prepare screenshot
    if (report._screenshotPreview && report._screenshotPreview.startsWith('data:image/')) {
      const screenshotUrl = this.getPresignedUrl('screenshot', presignedUrls);
      const screenshotBlob = await this.dataUrlToBlob(report._screenshotPreview);

      files.push({
        type: 'screenshot',
        url: screenshotUrl.uploadUrl,
        key: screenshotUrl.storageKey,
        blob: screenshotBlob,
      });
    }

    // Prepare replay
    if (report.replay && report.replay.length > 0) {
      const replayUrl = this.getPresignedUrl('replay', presignedUrls);
      const compressed = await compressData(report.replay);
      const replayBlob = new Blob([compressed as BlobPart], { type: 'application/gzip' });

      files.push({
        type: 'replay',
        url: replayUrl.uploadUrl,
        key: replayUrl.storageKey,
        blob: replayBlob,
      });
    }

    return files;
  }

  /**
   * Upload files to storage using presigned URLs (parallel execution)
   */
  private async uploadToStorage(files: FileToUpload[]): Promise<void> {
    const uploadPromises = files.map(async (file) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FileUploadHandler.UPLOAD_TIMEOUT_MS);

      try {
        const response = await fetch(file.url, {
          method: 'PUT',
          headers: {
            'Content-Type': file.blob.type || 'application/octet-stream',
          },
          body: file.blob,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return { success: response.ok, type: file.type };
      } catch (error) {
        clearTimeout(timeoutId);
        logger.error(`Upload failed for ${file.type}:`, error);
        return { success: false, type: file.type };
      }
    });

    const results = await Promise.all(uploadPromises);

    // Check for upload failures
    for (const result of results) {
      if (!result.success) {
        throw new Error(
          `${this.formatFileType(result.type)} upload failed: Upload to storage failed`
        );
      }
    }
  }

  /**
   * Confirm uploads with backend (parallel execution)
   */
  private async confirmUploads(files: FileToUpload[], bugId: string): Promise<void> {
    const confirmPromises = files.map(async (file) => {
      try {
        const response = await fetch(`${this.apiEndpoint}/api/v1/reports/${bugId}/confirm-upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
          },
          body: JSON.stringify({
            fileType: file.type,
          }),
        });
        return { success: response.ok, type: file.type };
      } catch (error) {
        logger.error(`Confirmation failed for ${file.type}:`, error);
        return { success: false, type: file.type };
      }
    });

    const results = await Promise.all(confirmPromises);

    // Check for confirmation failures
    for (const result of results) {
      if (!result.success) {
        throw new Error(
          `${this.formatFileType(result.type)} confirmation failed: Backend did not acknowledge upload`
        );
      }
    }
  }

  /**
   * Get presigned URL with validation
   */
  private getPresignedUrl(
    type: 'screenshot' | 'replay',
    presignedUrls: { screenshot?: PresignedUrlData; replay?: PresignedUrlData }
  ): PresignedUrlData {
    const url = presignedUrls[type];
    if (!url) {
      throw new Error(`${this.formatFileType(type)} presigned URL not provided by server`);
    }
    return url;
  }

  /**
   * Convert data URL to Blob
   */
  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      throw new Error('Invalid data URL');
    }
    const response = await fetch(dataUrl);
    if (!response || !response.blob) {
      throw new Error('Failed to convert data URL to Blob');
    }
    return await response.blob();
  }

  /**
   * Format file type for error messages (capitalize first letter)
   */
  private formatFileType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
