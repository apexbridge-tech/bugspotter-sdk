# Changelog

All notable changes to the BugSpotter SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1-alpha.5](https://github.com/apexbridge-tech/bugspotter/compare/sdk-v0.2.0-alpha.5...sdk-v0.2.1-alpha.5) (2025-11-21)


### Bug Fixes

* **test:** load rrweb from CDN for replay verification ([#297](https://github.com/apexbridge-tech/bugspotter/issues/297)) ([cbd575f](https://github.com/apexbridge-tech/bugspotter/commit/cbd575f4ab50da7b81df5be13d8a48fd48f391e6))


### Documentation

* **sdk:** update README to mention session replay feature ([#298](https://github.com/apexbridge-tech/bugspotter/issues/298)) ([28535c2](https://github.com/apexbridge-tech/bugspotter/commit/28535c2cf9df4deaebb96a92a4503a7371813142))

## [0.2.0-alpha.5](https://github.com/apexbridge-tech/bugspotter/compare/sdk-v0.1.3-alpha.5...sdk-v0.2.0-alpha.5) (2025-11-21)

### ⚠ BREAKING CHANGES

- **sdk:** BugSpotter.init() is now async and returns Promise<BugSpotter>. All callers must use `await BugSpotter.init(config)` instead of `BugSpotter.init(config)`. This change enables fetching replay quality settings from the backend before SDK initialization.

### Features

- **sdk:** add backend-controlled replay settings support ([#290](https://github.com/apexbridge-tech/bugspotter/issues/290)) ([0ea7c3b](https://github.com/apexbridge-tech/bugspotter/commit/0ea7c3b1ab456def3fd37c26bca6cf70da0f3ff9))

## [0.1.3-alpha.5](https://github.com/apexbridge-tech/bugspotter/compare/sdk-v0.1.2-alpha.5...sdk-v0.1.3-alpha.5) (2025-11-13)

### Tests

- **e2e:** migrate E2E tests from local storage to MinIO ([#229](https://github.com/apexbridge-tech/bugspotter/issues/229)) ([df5247d](https://github.com/apexbridge-tech/bugspotter/commit/df5247dee3a58d49dafe0c60f7f0bf6962c3cfb3))

## [0.1.2-alpha.6](https://github.com/apexbridge-tech/bugspotter/compare/sdk-v0.1.2-alpha.5...sdk-v0.1.2-alpha.6) (2025-11-13)

### Bug Fixes

- **sdk:** remove Content-Type header from presigned URL uploads to fix 403 errors - Presigned URLs from S3/B2 are signed with specific headers, and adding additional headers causes signature mismatch and 403 Forbidden errors. This critical fix removes the Content-Type header from both fetch() and XMLHttpRequest uploads to storage.

## [0.1.2-alpha.5](https://github.com/apexbridge-tech/bugspotter/compare/sdk-v0.1.1-alpha.5...sdk-v0.1.2-alpha.5) (2025-11-12)

### Bug Fixes

- **ci:** update SDK publish workflow to support prerelease tags ([#221](https://github.com/apexbridge-tech/bugspotter/issues/221)) ([dc4d7f2](https://github.com/apexbridge-tech/bugspotter/commit/dc4d7f2ef519afcf232704f05295729c6402008c))

## [0.1.1-alpha.5](https://github.com/apexbridge-tech/bugspotter/compare/sdk-v0.1.0-alpha.5...sdk-v0.1.1-alpha.5) (2025-11-12)

### Features

- add exponential backoff retry and offline queue support ([c3c2106](https://github.com/apexbridge-tech/bugspotter/commit/c3c21063b777da37011449b89431a63f987ea777))
- add FloatingButton widget and fix UMD exports ([b7e170e](https://github.com/apexbridge-tech/bugspotter/commit/b7e170eea47c7883722e59038a0d16b911c59588))
- add FloatingButton widget with refactored architecture ([87a3d0e](https://github.com/apexbridge-tech/bugspotter/commit/87a3d0e69cea86db01e2847323440f296f045b16))
- add gzip compression reducing payloads by 70-90% ([489e182](https://github.com/apexbridge-tech/bugspotter/commit/489e182ea072e3ffc43b58700b60288f6a255c22))
- add gzip compression reducing payloads by 70-90% ([c545acf](https://github.com/apexbridge-tech/bugspotter/commit/c545acf6fe9a973c74a54f63a560b4fd96465e83))
- add screenshot capture with html-to-image ([fae3eb7](https://github.com/apexbridge-tech/bugspotter/commit/fae3eb70fbf52d5b7c217f4d6d001735b661159d))
- add session replay with rrweb ([175bd74](https://github.com/apexbridge-tech/bugspotter/commit/175bd74765d7f49b4be681c02eae0d7bbe8b1bc4))
- add type safety system with shared types, Zod validation, and contract tests ([a3e436a](https://github.com/apexbridge-tech/bugspotter/commit/a3e436a931abda2cf30c85b32e5af2e011b7b3d9))
- complete BugSpotter v0.1.0 with full documentation ([651153b](https://github.com/apexbridge-tech/bugspotter/commit/651153b2d4c86b9653df6164539991ea92c41942))
- complete core SDK with all capture modules ([54fe97a](https://github.com/apexbridge-tech/bugspotter/commit/54fe97af32b2ee1aa09f5657b28b89e40454cb0a))
- fixed bug in NetworkCapture + eslint + prettier ([75e2d92](https://github.com/apexbridge-tech/bugspotter/commit/75e2d9290d82ea3f9b377e3b189ce933f7e3e336))
- initial project structure ([7109dc2](https://github.com/apexbridge-tech/bugspotter/commit/7109dc2e284ea8692081965e4b5a9cce4dc1b1e0))
- **sdk:** bump to 0.1.0-alpha.5 with improved release workflow ([#219](https://github.com/apexbridge-tech/bugspotter/issues/219)) ([a191b7b](https://github.com/apexbridge-tech/bugspotter/commit/a191b7b998863f00df4bd24f529057e4c4160a73))
- vitest configured + unit tests for capture ([381d11e](https://github.com/apexbridge-tech/bugspotter/commit/381d11e8ea45376c56ded0d62c2c37a726002acf))

### Bug Fixes

- increase browser test timeout and add GitHub release permissions ([#142](https://github.com/apexbridge-tech/bugspotter/issues/142)) ([301600e](https://github.com/apexbridge-tech/bugspotter/commit/301600e5fa6c01e0a6ef0e3281a0c27206cc00e2))
- remove await from background queue processing ([174889d](https://github.com/apexbridge-tech/bugspotter/commit/174889d9df5541d0494b736d9b8c44bbcbdfbb7e))
- **sdk:** remove unused @bugspotter/types workspace dependency ([#146](https://github.com/apexbridge-tech/bugspotter/issues/146)) ([7fed00b](https://github.com/apexbridge-tech/bugspotter/commit/7fed00bafab22f1854b78f861a90069b96a665c1))

### Code Refactoring

- Addressed comments on PR; ([fcb4888](https://github.com/apexbridge-tech/bugspotter/commit/fcb488813cd36147f6292c36f4540b23b7759e20))
- improve capture classes with options, types, and performance ([616bd35](https://github.com/apexbridge-tech/bugspotter/commit/616bd3502c7620f65494ae813ea39e87781b5a2f))
- improve transport and offline queue architecture ([01a27f3](https://github.com/apexbridge-tech/bugspotter/commit/01a27f3cc24d1211c65e4f0992fc969f40294e70))
- optimize demo & documentation structure ([22c2171](https://github.com/apexbridge-tech/bugspotter/commit/22c21712229f19b1280d1406c2fac60655d41c4a))
- Phase 2 - Extract shared capture architecture ([48d007c](https://github.com/apexbridge-tech/bugspotter/commit/48d007cecfc4651ded10a8c7fd4651fcec499fbd))
- Phase 2 - Extract shared capture architecture ([ea88dda](https://github.com/apexbridge-tech/bugspotter/commit/ea88dda3cdbb07d72f96d707a3ebb97edf93379c))
- Phase 2 - Extract shared capture architecture ([72f2425](https://github.com/apexbridge-tech/bugspotter/commit/72f242575c46c3c813bf15234ca95d5624b7d7d4))
- remove deprecated code and unused variables ([392bbb9](https://github.com/apexbridge-tech/bugspotter/commit/392bbb9c91e3d57a49b9650782b778aea9607d50))

### Tests

- Add comprehensive edge case tests for DOM collector ([24b56b3](https://github.com/apexbridge-tech/bugspotter/commit/24b56b3317edd6df656f551c7d22db3cc03df7ac))

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
