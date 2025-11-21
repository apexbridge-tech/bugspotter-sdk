import { EventType, type eventWithTime } from '@rrweb/types';

export interface CircularBufferConfig {
  /** Duration in seconds to keep events */
  duration: number;
}

/**
 * Time-based circular buffer for storing replay events.
 * Automatically prunes events older than the configured duration.
 * Always preserves the most recent full snapshot (EventType.FullSnapshot = 2).
 */
export class CircularBuffer<T extends eventWithTime = eventWithTime> {
  private events: T[] = [];
  private duration: number; // in milliseconds
  private lastFullSnapshotIndex = -1;

  constructor(config: CircularBufferConfig) {
    this.duration = config.duration * 1000; // convert to milliseconds
  }

  /**
   * Add an event to the buffer
   */
  add(event: T): void {
    // Track full snapshots
    if (event.type === EventType.FullSnapshot) {
      this.lastFullSnapshotIndex = this.events.length;
    }

    this.events.push(event);
    this.prune();
  }

  /**
   * Add multiple events to the buffer
   */
  addBatch(events: T[]): void {
    // Track full snapshots in batch (iterate backwards to find last one efficiently)
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].type === EventType.FullSnapshot) {
        this.lastFullSnapshotIndex = this.events.length + i;
        break; // Found the last snapshot, no need to continue
      }
    }

    this.events.push(...events);
    this.prune();
  }

  /**
   * Remove events older than the configured duration.
   * Always preserves the most recent full snapshot to ensure replay works.
   */
  private prune(): void {
    if (this.events.length === 0) {
      return;
    }

    const now = Date.now();
    const cutoffTime = now - this.duration;

    // Find the first event that should be kept
    let firstValidIndex = this.events.length; // Default: remove all
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].timestamp >= cutoffTime) {
        firstValidIndex = i;
        break;
      }
    }

    // Preserve full snapshot even if it's older than cutoff
    if (this.lastFullSnapshotIndex >= 0 && this.lastFullSnapshotIndex < firstValidIndex) {
      firstValidIndex = this.lastFullSnapshotIndex;
    }

    // Nothing to prune
    if (firstValidIndex === 0) {
      return;
    }

    // Remove old events and update snapshot index
    this.events = this.events.slice(firstValidIndex);

    if (this.lastFullSnapshotIndex >= 0) {
      this.lastFullSnapshotIndex -= firstValidIndex;
    }
  }

  /**
   * Get all events in the buffer
   */
  getEvents(): T[] {
    this.prune(); // Ensure we don't return stale events
    return [...this.events]; // Return a copy
  }

  /**
   * Get compressed event data
   */
  getCompressedEvents(): T[] {
    return this.getEvents();
  }

  /**
   * Clear all events from the buffer
   */
  clear(): void {
    this.events = [];
    this.lastFullSnapshotIndex = -1;
  }

  /**
   * Get the current size of the buffer
   */
  size(): number {
    return this.events.length;
  }

  /**
   * Update the buffer duration
   */
  setDuration(seconds: number): void {
    this.duration = seconds * 1000;
    this.prune();
  }

  /**
   * Get the buffer duration in seconds
   */
  getDuration(): number {
    return this.duration / 1000;
  }
}
