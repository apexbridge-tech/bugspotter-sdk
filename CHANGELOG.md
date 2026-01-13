# Changelog

All notable changes to the BugSpotter SDK will be documented in this file.

## [0.3.1] - 2026-01-13

### Added

- Node.js 22 LTS support for long-term stability
- pnpm 9.15.0 integration with improved dependency resolution
- Cross-browser E2E test suite (Chromium, Firefox, WebKit)
- Enhanced CI/CD pipeline with better error handling
- Backblaze B2 + BunnyCDN deployment support
- GitHub Actions workflow improvements (latest action versions)

### Changed

- Updated Firefox large DOM test timeout from 35s to 45s for better compatibility
- Improved ESLint configuration for test environments
- Better handling of runtime-injected globals in type checking
- Refactored release workflow for production deployments

### Fixed

- Resolved pnpm version conflict between CI config and package.json
- Fixed E2E test timeouts for slower browser environments
- Corrected TypeScript type definitions for test mocks
- Fixed npm provenance verification with correct repository URL

## [0.3.0] - 2026-01-10

### Added
- Initial standalone SDK release
- Session replay support with rrweb integration
- Automatic screenshot capture
- Offline queue support
- React integration example
- Vanilla JS integration example
- Comprehensive TypeScript types
- File upload capabilities

### Changed
- Extracted from BugSpotter monorepo into standalone repository
- Improved build process with webpack and vite support
- Enhanced error handling and validation

### Security
- PII detection and sanitization
- Secure file upload handling
- XSS protection in DOM manipulation

## [0.2.x] - Previous Versions

Previous versions were part of the main BugSpotter monorepo. See the [monorepo changelog](https://github.com/your-org/bugspotter/blob/main/packages/sdk/CHANGELOG.md) for historical changes.