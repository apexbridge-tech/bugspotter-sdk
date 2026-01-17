/**
 * SDK-wide constants
 */

/**
 * Default duration in seconds to keep replay events in buffer
 * Used by both BugSpotter and DOMCollector
 */
export const DEFAULT_REPLAY_DURATION_SECONDS = 15;

/**
 * Maximum recommended replay duration in seconds
 * Longer durations increase memory usage
 */
export const MAX_RECOMMENDED_REPLAY_DURATION_SECONDS = 30;
