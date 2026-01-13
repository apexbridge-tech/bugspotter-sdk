# BugSpotter SDK - Changelog

All notable changes to the BugSpotter SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-01-13

### Added

- Node.js 22 LTS support for long-term stability
- pnpm 9.15.0 integration with improved dependency resolution
- Cross-browser E2E test suite (Chromium, Firefox, WebKit)
- Enhanced CI/CD pipeline with better error handling

### Changed

- Updated Firebase large DOM test timeout from 35s to 45s for Firefox compatibility
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

### Features

- **Bundle size**: ~99 KB minified (with session replay)
- **Performance**: Screenshot capture ~500ms, PII sanitization <10ms
- **Browser support**: Chrome 55+, Firefox 55+, Safari 11+, Edge 79+ (ES2017+)
- **Memory efficient**: <15 MB for 30s replay buffer
- **CSP compliant**: No eval, no inline scripts

## [0.2.0] - 2025-11-21

### Added

- Session replay recording with rrweb (configurable buffer duration up to 30s)
- Mouse event sampling with configurable intervals
- Comprehensive E2E test suite with Playwright
- Support for Shadow DOM in replays

### Changed

- Improved capture classes with better options and performance
- Enhanced type safety system with Zod validation
- Refactored transport and offline queue architecture

## [0.1.0] - 2025-11-01

### Added - Initial Public Release

#### Core Features
- **Screenshot Capture**: Full-page screenshots with CSP-safe html-to-image implementation
- **Console Logging**: Capture all console messages (log, error, warn) with stack traces
- **Network Tracking**: Monitor all HTTP requests (fetch/XHR) with timing and status codes
- **Browser Metadata**: Automatic detection of browser, OS, and viewport information
- **DOM Capture**: Complete DOM structure preservation for debugging

#### Data Protection & Privacy
- **PII Sanitization**: Automatic detection and redaction of sensitive data
  - Email addresses, phone numbers, credit card numbers
  - Social Security Numbers (SSN), IP addresses
  - Custom pattern support via regex
- **Configurable Exclusion**: Per-element CSS selector based exclusion

#### Performance & Reliability
- **Compression**: gzip compression reduces payloads by 70-90%
- **Direct Upload**: Presigned URL uploads with 97% memory reduction
- **Offline Queue**: Store bug reports when offline, sync automatically
- **Exponential Backoff**: Intelligent retry strategy with configurable intervals
- **Circular Buffer**: Efficient session replay buffer management

#### User Interface
- **Floating Widget Button**: Customizable position, styling, and icon
- **Bug Report Modal**: User-friendly form for manual bug submission
- **Responsive Design**: Works on desktop and mobile viewports

#### Authentication & Integration
- **Multiple Auth Types**: API Key, Bearer token, custom headers
- **Framework Agnostic**: Works with vanilla JS, React, Vue, Angular, Next.js, Nuxt, Svelte

#### Module Formats
- **ESM** (ES Modules): `dist/index.esm.js`
- **CommonJS**: `dist/index.js`
- **UMD**: `dist/bugspotter.min.js`
- **TypeScript**: Full type definitions (`dist/index.d.ts`)

### Testing

- Comprehensive unit tests for all modules
- Integration tests for data flow
- E2E tests covering all major features
- Full test coverage for core functionality

---

[0.3.1]: https://github.com/apexbridge-tech/bugspotter-sdk/releases/tag/v0.3.1
[0.3.0]: https://github.com/apexbridge-tech/bugspotter-sdk/releases/tag/v0.3.0
[0.2.0]: https://github.com/apexbridge-tech/bugspotter-sdk/releases/tag/v0.2.0
[0.1.0]: https://github.com/apexbridge-tech/bugspotter-sdk/releases/tag/v0.1.0
