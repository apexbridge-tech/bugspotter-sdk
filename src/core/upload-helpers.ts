/**
 * Upload Helpers
 * Utilities for preparing data for presigned URL uploads
 */

/**
 * Compress replay events using CompressionStream API (browser native)
 * Falls back to no compression if API not available
 * @param events - Session replay events array
 * @returns Compressed Blob (gzip)
 */
export async function compressReplayEvents(events: unknown[]): Promise<Blob> {
  // Convert events to JSON string
  const jsonString = JSON.stringify(events);
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(jsonString);

  // Check if CompressionStream is supported (Chrome 80+, Firefox 113+, Safari 16.4+)
  if (typeof CompressionStream === 'undefined') {
    console.warn('CompressionStream not supported, uploading uncompressed replay data');
    return new Blob([data], { type: 'application/json' });
  }

  try {
    // Use modern streaming API: Blob → ReadableStream → CompressionStream → Response → Blob
    const blob = new Blob([data]);
    const compressedStream = blob.stream().pipeThrough(new CompressionStream('gzip'));
    return await new Response(compressedStream, {
      headers: { 'Content-Type': 'application/gzip' },
    }).blob();
  } catch (error) {
    console.error('Compression failed, uploading uncompressed:', error);
    return new Blob([data], { type: 'application/json' });
  }
}

/**
 * Convert screenshot canvas to Blob
 * @param canvas - HTML Canvas element with screenshot
 * @param quality - JPEG quality (0-1), default 0.9
 * @returns Screenshot Blob
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to Blob'));
        }
      },
      'image/png',
      quality
    );
  });
}

/**
 * Estimate compressed size of replay events
 * Uses rough heuristic: gzip typically achieves 80-90% compression for JSON
 * @param events - Replay events array
 * @returns Estimated compressed size in bytes
 */
export function estimateCompressedReplaySize(events: unknown[]): number {
  const jsonString = JSON.stringify(events);
  const uncompressedSize = new TextEncoder().encode(jsonString).length;

  // Assume 85% compression ratio (conservative estimate)
  return Math.round(uncompressedSize * 0.15);
}

/**
 * Check if file size is within upload limits
 * @param blob - File or Blob to check
 * @param maxSizeMB - Maximum size in megabytes
 * @returns True if within limit
 */
export function isWithinSizeLimit(blob: Blob, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return blob.size <= maxBytes;
}
