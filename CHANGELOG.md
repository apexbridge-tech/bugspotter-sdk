# Changelog

All notable changes to the BugSpotter SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-17

### Changed

- **Stable Release**: First production-ready 1.0.0 release
- Improved code quality and readability across core modules
- Enhanced test infrastructure with better Node.js and browser compatibility
- Optimized transport layer and URL validation logic

### Fixed

- E2E test compatibility issues in Playwright test suite
- Integration test Node.js Buffer API compatibility
- ESLint configuration for test environment globals

## [0.3.1] - 2026-01-13

### Added

- Node.js 22 LTS support for long-term stability
- pnpm 9.15.0 integration with improved dependency resolution
- Cross-browser E2E test suite (Chromium, Firefox, WebKit)
- Enhanced CI/CD pipeline with better error handling
- CDN deployment support in release workflow

### Changed

- Updated Firefox large DOM test timeout from 35s to 45s for better compatibility
- Improved ESLint configuration for test environments
- Better handling of runtime-injected globals in type checking

### Fixed

- Resolved pnpm version conflict between CI config and package.json
- Fixed E2E test timeouts for slower browser environments
- Corrected TypeScript type definitions for test mocks

## [0.3.0] - 2025-12-20

### Added

- **Duplicate Prevention System**: Automatic detection and prevention of duplicate bug reports
- **Backend-Controlled Replay Settings**: Dynamic replay configuration from server
- **Upload Progress Feedback**: Real-time progress indication for file uploads
- **Screenshot Proxy Endpoint**: Server-side screenshot proxy support
- **SDK Internal Log Filtering**: Automatic exclusion of SDK's own logs from reports

### Changed

- BugSpotter.init() is now async (returns Promise<BugSpotter>)
- Improved transport layer architecture
- Enhanced offline queue management

## [0.2.0] - 2025-11-21

### Added

- **Session Replay**: Recording with rrweb (configurable buffer duration up to 30s)
- **Mouse Event Sampling**: Configurable intervals for mouse tracking
- **Comprehensive E2E Tests**: Full test suite with Playwright (Chromium, Firefox, WebKit)
- **Shadow DOM Support**: Complete replay capture for Shadow DOM content
- **Type Safety Enhancements**: Improved Zod validation and type definitions

### Changed

- Refactored capture classes with better options and performance
- Improved transport and offline queue architecture
- Enhanced error handling in retry logic

### Fixed

- Content-Type header removal from presigned URL uploads (fixed 403 errors)
- rrweb CDN loading for reliable replay verification
- Release workflow prerelease tag support

## [0.1.0] - 2025-11-01

### Added

#### Core Capture Features
- **Screenshot Capture**: Full-page screenshots with CSP-safe html-to-image library
- **Console Logging**: Capture all console messages with stack traces
- **Network Tracking**: Monitor all HTTP requests (fetch/XHR) with timing
- **Browser Metadata**: Automatic detection of browser, OS, viewport
- **DOM Capture**: Complete DOM structure preservation

#### Data Protection & Privacy
- **PII Sanitization**: Automatic detection and redaction of sensitive data
  - Built-in patterns: email, phone, credit card, SSN, IIN, IP address
  - Custom regex pattern support
  - Per-element CSS selector-based exclusion
- **Content Security Policy (CSP) Compliant**: No eval, no inline scripts

#### Reliability & Performance
- **Compression**: gzip compression reduces payloads by 70-90%
- **Direct Upload**: Presigned URL uploads with 97% memory reduction vs base64
- **Offline Queue**: Store and sync bug reports when network unavailable
- **Exponential Backoff**: Intelligent retry strategy with configurable delays
- **Circular Buffering**: Efficient memory usage for long-running sessions

#### User Interface
- **Floating Widget Button**: Customizable position (corner/edge), styling, and icon
- **Bug Report Modal**: User-friendly form with validation for manual submission
- **Responsive Design**: Optimized for both desktop and mobile viewports

#### Authentication & Integration
- **Multiple Auth Types**: API Key, Bearer token, custom headers
- **Framework Agnostic**: Works with vanilla JavaScript and all major frameworks

#### Module Formats & TypeScript
- **ESM, CommonJS, UMD**: Support for all modern module systems
- **TypeScript Support**: Full type definitions with proper generic types
- **Source Maps**: Included for debugging and production support

#### Documentation
- Complete API reference with examples
- Framework integration guides (React, Vue, Angular, Next.js, Nuxt, Svelte)
- Session replay configuration and best practices
- PII sanitization customization guide
- Direct upload implementation guide
