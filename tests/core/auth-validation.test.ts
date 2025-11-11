import { describe, it, expect, beforeEach } from 'vitest';
import { BugSpotter } from '../../src/index';
import type { BugSpotterConfig } from '../../src/index';

describe('BugSpotter - Authentication Validation', () => {
  let baseConfig: BugSpotterConfig;

  beforeEach(() => {
    baseConfig = {
      endpoint: 'https://api.example.com/api/v1/reports',
      showWidget: false,
      auth: {
        type: 'api-key',
        apiKey: 'test-api-key',
        projectId: 'test-project-id',
      },
    };
  });

  describe('validateAuthConfig', () => {
    it('should throw if endpoint is missing', async () => {
      const config = { ...baseConfig, endpoint: undefined } as any;
      const bugSpotter = new BugSpotter(config);
      const report = await bugSpotter.capture();

      await expect(
        (bugSpotter as any).submitBugReport({
          title: 'Test',
          description: 'Test',
          report,
        })
      ).rejects.toThrow('No endpoint configured for bug report submission');
    });

    it('should throw if endpoint is empty string', async () => {
      const config = { ...baseConfig, endpoint: '' } as any;
      const bugSpotter = new BugSpotter(config);
      const report = await bugSpotter.capture();

      await expect(
        (bugSpotter as any).submitBugReport({
          title: 'Test',
          description: 'Test',
          report,
        })
      ).rejects.toThrow('No endpoint configured for bug report submission');
    });

    it('should throw if auth is missing', async () => {
      const config = { ...baseConfig, auth: undefined as any };
      const bugSpotter = new BugSpotter(config);
      const report = await bugSpotter.capture();

      await expect(
        (bugSpotter as any).submitBugReport({
          title: 'Test',
          description: 'Test',
          report,
        })
      ).rejects.toThrow('API key authentication is required');
    });

    it('should throw if auth type is not api-key', async () => {
      const config = {
        ...baseConfig,
        auth: { type: 'bearer', apiKey: 'test', projectId: 'test' } as any,
      };
      const bugSpotter = new BugSpotter(config);
      const report = await bugSpotter.capture();

      await expect(
        (bugSpotter as any).submitBugReport({
          title: 'Test',
          description: 'Test',
          report,
        })
      ).rejects.toThrow('API key authentication is required');
    });

    it('should throw if apiKey is missing', async () => {
      const config = {
        ...baseConfig,
        auth: { type: 'api-key', apiKey: undefined, projectId: 'test' } as any,
      } as any;
      const bugSpotter = new BugSpotter(config);
      const report = await bugSpotter.capture();

      await expect(
        (bugSpotter as any).submitBugReport({
          title: 'Test',
          description: 'Test',
          report,
        })
      ).rejects.toThrow('API key is required in auth configuration');
    });

    it('should throw if apiKey is empty string', async () => {
      const config = {
        ...baseConfig,
        auth: { type: 'api-key', apiKey: '', projectId: 'test' } as any,
      } as any;
      const bugSpotter = new BugSpotter(config);
      const report = await bugSpotter.capture();

      await expect(
        (bugSpotter as any).submitBugReport({
          title: 'Test',
          description: 'Test',
          report,
        })
      ).rejects.toThrow('API key is required in auth configuration');
    });

    it('should throw if projectId is missing', async () => {
      const config = {
        ...baseConfig,
        auth: { type: 'api-key', apiKey: 'test', projectId: undefined } as any,
      } as any;
      const bugSpotter = new BugSpotter(config);
      const report = await bugSpotter.capture();

      await expect(
        (bugSpotter as any).submitBugReport({
          title: 'Test',
          description: 'Test',
          report,
        })
      ).rejects.toThrow('Project ID is required in auth configuration');
    });

    it('should throw if projectId is empty string', async () => {
      const config = {
        ...baseConfig,
        auth: { type: 'api-key', apiKey: 'test', projectId: '' } as any,
      } as any;
      const bugSpotter = new BugSpotter(config);
      const report = await bugSpotter.capture();

      await expect(
        (bugSpotter as any).submitBugReport({
          title: 'Test',
          description: 'Test',
          report,
        })
      ).rejects.toThrow('Project ID is required in auth configuration');
    });
  });
});
