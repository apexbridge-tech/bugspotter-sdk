import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BugReportDeduplicator } from '../../src/utils/deduplicator';

describe('BugReportDeduplicator', () => {
  let deduplicator: BugReportDeduplicator;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    deduplicator?.destroy();
    vi.useRealTimers();
  });

  describe('Configuration', () => {
    it('should initialize with default configuration', () => {
      deduplicator = new BugReportDeduplicator();
      expect(deduplicator).toBeDefined();
    });

    it('should accept custom window duration', () => {
      deduplicator = new BugReportDeduplicator({ windowMs: 30000 });
      expect(deduplicator).toBeDefined();
    });

    it('should accept custom cache size', () => {
      deduplicator = new BugReportDeduplicator({ maxCacheSize: 50 });
      expect(deduplicator).toBeDefined();
    });

    it('should allow disabling deduplication', () => {
      deduplicator = new BugReportDeduplicator({ enabled: false });
      const isDuplicate = deduplicator.isDuplicate('Test', 'Description');
      expect(isDuplicate).toBe(false);
    });
  });

  describe('In-Progress Tracking', () => {
    beforeEach(() => {
      deduplicator = new BugReportDeduplicator();
    });

    it('should track in-progress state per fingerprint', () => {
      const title = 'Test Bug';
      const desc = 'Description';

      expect(deduplicator.isInProgress(title, desc)).toBe(false);

      deduplicator.markInProgress(title, desc);
      expect(deduplicator.isInProgress(title, desc)).toBe(true);

      deduplicator.markComplete(title, desc);
      expect(deduplicator.isInProgress(title, desc)).toBe(false);
    });

    it('should block duplicate submission when specific report is in progress', () => {
      const title = 'Test Bug';
      const desc = 'Description';

      deduplicator.markInProgress(title, desc);

      const isDuplicate = deduplicator.isDuplicate(title, desc);
      expect(isDuplicate).toBe(true);
    });

    it('should allow submission after previous request completes', () => {
      const title = 'Test Bug';
      const desc = 'Description';

      deduplicator.markInProgress(title, desc);
      deduplicator.markComplete(title, desc);

      const isDuplicate = deduplicator.isDuplicate(title, desc);
      expect(isDuplicate).toBe(false);
    });

    it('should track multiple reports independently', () => {
      const report1 = { title: 'Bug A', desc: 'Description A' };
      const report2 = { title: 'Bug B', desc: 'Description B' };

      // Mark report1 as in progress
      deduplicator.markInProgress(report1.title, report1.desc);

      // Report1 should be blocked
      expect(deduplicator.isDuplicate(report1.title, report1.desc)).toBe(true);

      // Report2 should NOT be blocked (different fingerprint)
      expect(deduplicator.isDuplicate(report2.title, report2.desc)).toBe(false);

      // Mark report2 as in progress too
      deduplicator.markInProgress(report2.title, report2.desc);

      // Both should be blocked now
      expect(deduplicator.isDuplicate(report1.title, report1.desc)).toBe(true);
      expect(deduplicator.isDuplicate(report2.title, report2.desc)).toBe(true);

      // Complete report1
      deduplicator.markComplete(report1.title, report1.desc);

      // Report1 should be unblocked, report2 still blocked
      expect(deduplicator.isDuplicate(report1.title, report1.desc)).toBe(false);
      expect(deduplicator.isDuplicate(report2.title, report2.desc)).toBe(true);
    });

    it('should handle in-progress state with error details', () => {
      const error = { message: 'Error', stack: 'at line 10' };
      const title = 'Bug';
      const desc = 'Desc';

      deduplicator.markInProgress(title, desc, error);
      expect(deduplicator.isInProgress(title, desc, error)).toBe(true);
      expect(deduplicator.isDuplicate(title, desc, error)).toBe(true);

      // Same title/desc but different error should NOT be blocked
      const differentError = { message: 'Error', stack: 'at line 20' };
      expect(deduplicator.isDuplicate(title, desc, differentError)).toBe(false);
    });
  });

  describe('Duplicate Detection', () => {
    beforeEach(() => {
      deduplicator = new BugReportDeduplicator({ windowMs: 60000 });
    });

    it('should not flag first submission as duplicate', () => {
      const isDuplicate = deduplicator.isDuplicate('Critical Error', 'App crashed');
      expect(isDuplicate).toBe(false);
    });

    it('should detect exact duplicate within time window', () => {
      deduplicator.recordSubmission('Critical Error', 'App crashed');

      const isDuplicate = deduplicator.isDuplicate('Critical Error', 'App crashed');
      expect(isDuplicate).toBe(true);
    });

    it('should be case-insensitive for duplicates', () => {
      deduplicator.recordSubmission('Critical Error', 'App crashed');

      const isDuplicate = deduplicator.isDuplicate('CRITICAL ERROR', 'APP CRASHED');
      expect(isDuplicate).toBe(true);
    });

    it('should ignore whitespace differences', () => {
      deduplicator.recordSubmission('Critical Error', 'App crashed');

      const isDuplicate = deduplicator.isDuplicate('  Critical Error  ', '  App crashed  ');
      expect(isDuplicate).toBe(true);
    });

    it('should detect duplicates with error details', () => {
      const errorDetails = {
        message: 'TypeError: Cannot read property',
        stack: 'Error at line 42',
      };

      deduplicator.recordSubmission('JS Error', 'Type error', errorDetails);

      const isDuplicate = deduplicator.isDuplicate('JS Error', 'Type error', errorDetails);
      expect(isDuplicate).toBe(true);
    });

    it('should allow different reports', () => {
      deduplicator.recordSubmission('Error A', 'Description A');

      const isDuplicate = deduplicator.isDuplicate('Error B', 'Description B');
      expect(isDuplicate).toBe(false);
    });

    it('should allow same report after time window expires', () => {
      deduplicator.recordSubmission('Critical Error', 'App crashed');

      // Advance time beyond window (60 seconds)
      vi.advanceTimersByTime(61000);

      const isDuplicate = deduplicator.isDuplicate('Critical Error', 'App crashed');
      expect(isDuplicate).toBe(false);
    });
  });

  describe('Submission Recording', () => {
    beforeEach(() => {
      deduplicator = new BugReportDeduplicator({ windowMs: 60000 });
    });

    it('should record successful submissions', () => {
      deduplicator.recordSubmission('Bug Title', 'Bug Description');

      const isDuplicate = deduplicator.isDuplicate('Bug Title', 'Bug Description');
      expect(isDuplicate).toBe(true);
    });

    it('should record submissions with error details', () => {
      const errorDetails = { message: 'Error occurred', stack: 'at function()' };
      deduplicator.recordSubmission('Bug', 'Desc', errorDetails);

      const isDuplicate = deduplicator.isDuplicate('Bug', 'Desc', errorDetails);
      expect(isDuplicate).toBe(true);
    });

    it('should not record when disabled', () => {
      const disabledDeduplicator = new BugReportDeduplicator({ enabled: false });

      disabledDeduplicator.recordSubmission('Test', 'Test');
      // Should not track anything when disabled

      disabledDeduplicator.destroy();
    });
  });

  describe('Cache Management', () => {
    it('should enforce maximum cache size', () => {
      deduplicator = new BugReportDeduplicator({ maxCacheSize: 3 });

      // Add 4 reports (exceeds limit)
      deduplicator.recordSubmission('Bug 1', 'Description 1');
      expect(deduplicator.getCacheSize()).toBe(1);

      deduplicator.recordSubmission('Bug 2', 'Description 2');
      expect(deduplicator.getCacheSize()).toBe(2);

      deduplicator.recordSubmission('Bug 3', 'Description 3');
      expect(deduplicator.getCacheSize()).toBe(3);

      deduplicator.recordSubmission('Bug 4', 'Description 4');
      // Cache should NEVER exceed maxCacheSize (prevents off-by-one bug)
      expect(deduplicator.getCacheSize()).toBe(3);

      // First one should be evicted
      const isDuplicate1 = deduplicator.isDuplicate('Bug 1', 'Description 1');
      expect(isDuplicate1).toBe(false); // Evicted

      // Last one should still be cached
      const isDuplicate4 = deduplicator.isDuplicate('Bug 4', 'Description 4');
      expect(isDuplicate4).toBe(true);
    });

    it('should clean up expired entries', () => {
      deduplicator = new BugReportDeduplicator({ windowMs: 30000 });

      deduplicator.recordSubmission('Old Bug', 'Old Description');

      // Advance time past window
      vi.advanceTimersByTime(35000);

      // Trigger cleanup (normally runs on interval)
      vi.advanceTimersByTime(15000); // Half window interval

      const isDuplicate = deduplicator.isDuplicate('Old Bug', 'Old Description');
      expect(isDuplicate).toBe(false);
    });
  });

  describe('Clear and Destroy', () => {
    beforeEach(() => {
      deduplicator = new BugReportDeduplicator();
    });

    it('should clear all cached reports', () => {
      deduplicator.recordSubmission('Bug 1', 'Desc 1');
      deduplicator.recordSubmission('Bug 2', 'Desc 2');

      deduplicator.clear();

      expect(deduplicator.isDuplicate('Bug 1', 'Desc 1')).toBe(false);
      expect(deduplicator.isDuplicate('Bug 2', 'Desc 2')).toBe(false);
    });

    it('should stop cleanup interval on destroy', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      deduplicator.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should clear cache on destroy', () => {
      deduplicator.recordSubmission('Test', 'Test');
      deduplicator.destroy();

      // Create new instance
      deduplicator = new BugReportDeduplicator();
      expect(deduplicator.isDuplicate('Test', 'Test')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      deduplicator = new BugReportDeduplicator();
    });

    it('should handle empty strings', () => {
      deduplicator.recordSubmission('', '');

      const isDuplicate = deduplicator.isDuplicate('', '');
      expect(isDuplicate).toBe(true);
    });

    it('should handle very long strings', () => {
      const longTitle = 'A'.repeat(10000);
      const longDesc = 'B'.repeat(10000);

      deduplicator.recordSubmission(longTitle, longDesc);

      const isDuplicate = deduplicator.isDuplicate(longTitle, longDesc);
      expect(isDuplicate).toBe(true);
    });

    it('should handle special characters', () => {
      const title = 'Error: <script>alert("xss")</script>';
      const desc = 'Description with \n\r\t special chars';

      deduplicator.recordSubmission(title, desc);

      const isDuplicate = deduplicator.isDuplicate(title, desc);
      expect(isDuplicate).toBe(true);
    });

    it('should handle undefined error details', () => {
      deduplicator.recordSubmission('Bug', 'Desc', undefined);

      const isDuplicate = deduplicator.isDuplicate('Bug', 'Desc', undefined);
      expect(isDuplicate).toBe(true);
    });

    it('should handle null error details', () => {
      deduplicator.recordSubmission('Bug', 'Desc', null as unknown as undefined);

      const isDuplicate = deduplicator.isDuplicate('Bug', 'Desc', null as unknown as undefined);
      expect(isDuplicate).toBe(true);
    });

    it('should differentiate reports with different error stacks', () => {
      const error1 = { message: 'Error', stack: 'at line 10' };
      const error2 = { message: 'Error', stack: 'at line 20' };

      deduplicator.recordSubmission('Bug', 'Desc', error1);

      const isDuplicate = deduplicator.isDuplicate('Bug', 'Desc', error2);
      expect(isDuplicate).toBe(false); // Different stack
    });

    it('should handle array of errors for comprehensive fingerprinting', () => {
      const errors = [
        { message: 'TypeError', stack: 'at app.js:10' },
        { message: 'ReferenceError', stack: 'at app.js:20' },
      ];

      deduplicator.recordSubmission('Multiple Errors', 'App crashed', errors);

      const isDuplicate = deduplicator.isDuplicate('Multiple Errors', 'App crashed', errors);
      expect(isDuplicate).toBe(true);
    });

    it('should differentiate reports with same first error but different subsequent errors', () => {
      const errors1 = [
        { message: 'TypeError', stack: 'at app.js:10' },
        { message: 'ReferenceError', stack: 'at app.js:20' },
      ];

      const errors2 = [
        { message: 'TypeError', stack: 'at app.js:10' }, // Same first error
        { message: 'SyntaxError', stack: 'at app.js:30' }, // Different second error
      ];

      deduplicator.recordSubmission('Bug', 'Desc', errors1);

      const isDuplicate = deduplicator.isDuplicate('Bug', 'Desc', errors2);
      expect(isDuplicate).toBe(false); // Should be different due to different error array
    });

    it('should handle empty error array', () => {
      const emptyErrors: unknown[] = [];

      deduplicator.recordSubmission('Bug', 'Desc', emptyErrors);

      const isDuplicate = deduplicator.isDuplicate('Bug', 'Desc', emptyErrors);
      expect(isDuplicate).toBe(true);
    });

    it('should handle mixed single error and array usage', () => {
      const singleError = { message: 'Error', stack: 'at line 10' };
      const errorArray = [{ message: 'Error', stack: 'at line 10' }];

      deduplicator.recordSubmission('Bug', 'Desc', singleError);

      // Array with same error content should be treated as duplicate (backward compatibility)
      const isDuplicate = deduplicator.isDuplicate('Bug', 'Desc', errorArray);
      expect(isDuplicate).toBe(true); // Same content = duplicate
    });
  });

  describe('Concurrent Submissions', () => {
    beforeEach(() => {
      deduplicator = new BugReportDeduplicator();
    });

    it('should block second submission of same report while first is in progress', () => {
      const title = 'Bug';
      const desc = 'Desc';

      // Simulate first submission starting
      deduplicator.markInProgress(title, desc);

      // Second submission attempt should be blocked
      const isDuplicate = deduplicator.isDuplicate(title, desc);
      expect(isDuplicate).toBe(true);

      // First submission completes
      deduplicator.markComplete(title, desc);
      deduplicator.recordSubmission(title, desc);

      // Third submission should be blocked by fingerprint
      const isDuplicate2 = deduplicator.isDuplicate(title, desc);
      expect(isDuplicate2).toBe(true);
    });

    it('should allow concurrent submissions of different reports', () => {
      const report1 = { title: 'Bug A', desc: 'Description A' };
      const report2 = { title: 'Bug B', desc: 'Description B' };

      // Mark report1 as in progress
      deduplicator.markInProgress(report1.title, report1.desc);

      // Different bug should NOT be blocked (per-fingerprint tracking)
      const isDuplicate = deduplicator.isDuplicate(report2.title, report2.desc);
      expect(isDuplicate).toBe(false);
    });

    it('should handle rapid concurrent submissions of same report', () => {
      const title = 'Critical Bug';
      const desc = 'App crashed';
      const error = { message: 'TypeError', stack: 'at app.js:100' };

      // Simulate rapid double-click
      deduplicator.markInProgress(title, desc, error);

      // Second click should be blocked immediately
      expect(deduplicator.isDuplicate(title, desc, error)).toBe(true);

      deduplicator.markComplete(title, desc, error);
    });

    it('should clear in-progress state when destroyed', () => {
      const title = 'Bug';
      const desc = 'Desc';

      deduplicator.markInProgress(title, desc);
      expect(deduplicator.isDuplicate(title, desc)).toBe(true);

      deduplicator.clear();

      // Should no longer be blocked after clear
      expect(deduplicator.isDuplicate(title, desc)).toBe(false);
    });
  });

  describe('Real-world Scenarios', () => {
    beforeEach(() => {
      deduplicator = new BugReportDeduplicator({ windowMs: 60000 });
    });

    it('should prevent double-click submissions', () => {
      const title = 'Bug';
      const desc = 'Desc';

      // User clicks submit button twice rapidly
      deduplicator.markInProgress(title, desc);
      expect(deduplicator.isDuplicate(title, desc)).toBe(true);

      deduplicator.markComplete(title, desc);
      deduplicator.recordSubmission(title, desc);
    });

    it('should allow retry after network error', () => {
      const title = 'Bug';
      const desc = 'Desc';

      // First attempt
      deduplicator.markInProgress(title, desc);
      deduplicator.markComplete(title, desc);
      // Don't record - submission failed

      // Retry should be allowed (no fingerprint recorded)
      expect(deduplicator.isDuplicate(title, desc)).toBe(false);
    });

    it('should allow same error from different pages', () => {
      const error1 = { message: 'TypeError', stack: 'at page1.js:10' };
      const error2 = { message: 'TypeError', stack: 'at page2.js:20' };

      deduplicator.recordSubmission('TypeError', 'Null reference', error1);

      // Same error from different location should be allowed
      const isDuplicate = deduplicator.isDuplicate('TypeError', 'Null reference', error2);
      expect(isDuplicate).toBe(false);
    });

    it('should block rapid re-submissions of same error', () => {
      const error = { message: 'ReferenceError', stack: 'at app.js:100' };

      // User submits error
      deduplicator.recordSubmission('ReferenceError', 'Undefined var', error);

      // 10 seconds later, same error occurs - should be blocked
      vi.advanceTimersByTime(10000);
      expect(deduplicator.isDuplicate('ReferenceError', 'Undefined var', error)).toBe(true);

      // 70 seconds later, error occurs again - should be allowed
      vi.advanceTimersByTime(60000);
      expect(deduplicator.isDuplicate('ReferenceError', 'Undefined var', error)).toBe(false);
    });
  });
});
