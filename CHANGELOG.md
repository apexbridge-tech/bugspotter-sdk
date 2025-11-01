# Changelog

All notable changes to the BugSpotter SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-01

### Added

- Initial public release of BugSpotter SDK
- Screenshot capture with CSP-safe implementation using html-to-image
- Session replay recording with rrweb (configurable buffer duration)
- Console log capture (all levels with stack traces)
- Network request capture (fetch/XHR with timing)
- Browser metadata capture (browser, OS, viewport detection)
- Automatic PII detection and sanitization
  - Built-in patterns: email, phone, credit card, SSN, IIN, IP address
  - Custom pattern support
  - Configurable exclusion selectors
- Direct file uploads using presigned URLs (97% memory reduction)
- Compression utilities for replay data (gzip)
- Floating widget button with customizable position and styling
- Bug report modal with form validation
- Authentication support (API key, Bearer token, Custom headers)
- Retry logic for failed requests
- Offline queue for network resilience
- TypeScript support with full type definitions
- Multiple module formats: ESM, CommonJS, UMD
- Framework integration examples for React, Vue, Angular, Next.js, Nuxt, Svelte

### Features

- **Bundle size**: ~99 KB minified (with session replay)
- **Performance**: Screenshot capture ~500ms, PII sanitization <10ms
- **Browser support**: Chrome 55+, Firefox 55+, Safari 11+, Edge 79+ (ES2017+)
- **Memory efficient**: <15 MB for 30s replay buffer
- **CSP compliant**: No eval, no inline scripts

### Documentation

- Complete API reference
- Framework integration guide (React, Vue, Angular, Next.js, Nuxt, Svelte)
- Session replay configuration guide
- PII sanitization guide
- Direct upload guide with examples

### Testing

- 345 tests (unit + E2E + Playwright)
- Full test coverage for core functionality

## [Unreleased]

### Planned Features

- Real-time error tracking
- Performance monitoring
- User session tracking
- Custom event tracking
- Source map support
- Analytics dashboard integration
- Webhooks support
- Additional integrations (Slack, Discord, Email)

---

[0.1.0]: https://github.com/apexbridge-tech/bugspotter/releases/tag/sdk-v0.1.0
