# SDK Publishing & Release Management

This document describes the CI/CD workflows for publishing `@bugspotter/sdk` to npm with automated versioning and changelog management.

## 📋 Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Manual Publishing](#manual-publishing)
- [Automated Publishing](#automated-publishing)
- [Conventional Commits](#conventional-commits)
- [Setup Requirements](#setup-requirements)
- [Versioning Strategy](#versioning-strategy)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

We use two complementary workflows for SDK releases:

1. **Manual Publish** (`sdk-publish.yml`) - For immediate releases with full control
2. **Release Please** (`sdk-release-please.yml`) - For automated releases based on conventional commits

## 🔄 Workflows

### 1. Manual Publish Workflow (`sdk-publish.yml`)

**When to use:**

- Emergency hotfixes only
- Critical security patches that can't wait
- Testing the publish pipeline (dry-run mode)

**⚠️ Important:** This workflow does **NOT** update CHANGELOG.md automatically. Use Release Please for regular releases to get automatic changelog generation.

**Triggers:**

- Manual workflow dispatch from GitHub Actions UI
- Git tags matching `sdk-v*.*.*` pattern

**Features:**

- ✅ Full test suite (unit, E2E, Playwright)
- ✅ Build verification (CommonJS, ESM, UMD)
- ✅ Bundle size reporting
- ✅ Dry-run mode for testing
- ✅ Direct version calculation (no file modifications)
- ✅ Git tag creation
- ✅ GitHub release creation
- ✅ NPM publishing
- ⚠️ Manual CHANGELOG update required after release

**How to use:**

1. **Via GitHub UI:**
   - Go to Actions → Publish SDK to NPM
   - Click "Run workflow"
   - Select branch (usually `main`)
   - Choose version bump: `patch`, `minor`, or `major`
   - Check "Dry run" to test without publishing
   - Click "Run workflow"

2. **Via Git Tag:**
   ```bash
   git tag sdk-v0.1.1
   git push origin sdk-v0.1.1
   ```

### 2. Release Please Workflow (`sdk-release-please.yml`) ⭐ **Recommended**

**When to use:**

- Regular releases (this should be your primary workflow)
- Automated release management
- Following conventional commit standards
- Automatic changelog generation
- Continuous delivery approach

**Triggers:**

- Push to `main` branch with changes to `packages/sdk/**`

**Features:**

- ✅ Automatic version calculation from commits
- ✅ Automated CHANGELOG generation with commit details
- ✅ Groups changes by type (Features, Fixes, etc.)
- ✅ Links to commits and PRs automatically
- ✅ Release PR creation for team review
- ✅ Publishes after PR merge
- ✅ Follows semantic versioning
- ✅ Industry standard (used by Google, Angular, etc.)

**How it works:**

1. Developer pushes commits to `main` using conventional format
2. Release Please analyzes commits since last release
3. Creates/updates a release PR with:
   - Updated version in `package.json`
   - Updated `CHANGELOG.md`
   - Summary of changes
4. When PR is merged, automatically:
   - Runs full test suite
   - Verifies build artifacts
   - Checks bundle size
   - Publishes to npm

## 📝 Conventional Commits

Release Please uses conventional commits to determine version bumps:

### Commit Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Commit Types & Version Bumps

| Type     | Version Bump              | Example                                      |
| -------- | ------------------------- | -------------------------------------------- |
| `feat:`  | **minor** (0.1.0 → 0.2.0) | `feat: add Vue 3 composition API support`    |
| `fix:`   | **patch** (0.1.0 → 0.1.1) | `fix: resolve memory leak in session replay` |
| `feat!:` | **major** (0.1.0 → 1.0.0) | `feat!: change API initialization signature` |
| `fix!:`  | **major** (0.1.0 → 1.0.0) | `fix!: remove deprecated methods`            |
| `perf:`  | **patch** (0.1.0 → 0.1.1) | `perf: optimize screenshot compression`      |
| `docs:`  | _no bump_                 | `docs: update React integration guide`       |
| `chore:` | _no bump_                 | `chore: update dependencies`                 |
| `style:` | _no bump_                 | `style: fix code formatting`                 |
| `test:`  | _no bump_                 | `test: add E2E tests for modal`              |

### Breaking Changes

Add `!` after type or `BREAKING CHANGE:` in footer for major version bumps:

```bash
# Method 1: Using !
git commit -m "feat!: change init() to require apiKey parameter"

# Method 2: Using footer
git commit -m "feat: change initialization API

BREAKING CHANGE: init() now requires apiKey as first parameter"
```

### Examples

```bash
# New feature (minor bump)
git commit -m "feat: add automatic error boundary for React"

# Bug fix (patch bump)
git commit -m "fix: resolve XSS vulnerability in sanitizer"

# Performance improvement (patch bump)
git commit -m "perf: reduce bundle size by 15%"

# Documentation (no bump)
git commit -m "docs: add Angular integration examples"

# Breaking change (major bump)
git commit -m "feat!: change transport API to use async/await"
```

## 🔧 Setup Requirements

### 1. NPM Token

The workflow requires an NPM automation token with publish permissions:

1. **Create token on npmjs.com:**
   - Log in to npmjs.com
   - Go to Access Tokens → Generate New Token
   - Select "Automation" type
   - Copy the token

2. **Add to GitHub Secrets:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: `npm_xxxxxxxxxxxxxxxxxxxx`
   - Click "Add secret"

### 1.5 CDN Deployment Secrets (Optional)

If using the CDN deployment workflow (`sdk-cdn-deploy.yml`), configure these additional secrets:

**Backblaze B2 + BunnyCDN (7 secrets required):**

1. **`B2_APPLICATION_KEY_ID`** - Your B2 application key ID
2. **`B2_APPLICATION_KEY`** - Your B2 application key
3. **`B2_BUCKET_NAME`** - Your B2 bucket name (e.g., `bugspotter-sdk-cdn`)
4. **`B2_ENDPOINT`** - Your B2 region endpoint (e.g., `https://f003.backblazeb2.com`)
5. **`CDN_URL`** - Your BunnyCDN domain (e.g., `https://cdn.bugspotter.io`)
6. **`BUNNY_API_KEY`** - Your BunnyCDN API key
7. **`BUNNY_PULL_ZONE_ID`** - Your BunnyCDN pull zone ID

**Why secrets for URLs?**

- Prevents exposing CDN provider and infrastructure details
- Easy to change providers/domains without code changes
- Consistent security across all configuration values

**Note:** The CDN workflow supports multiple providers (AWS S3, Cloudflare R2, Azure, GitHub Pages). Enable your preferred provider in `sdk-cdn-deploy.yml` by setting `if: true` on the corresponding deployment step.

### 2. GitHub Token

The `GITHUB_TOKEN` is automatically provided by GitHub Actions. It has permissions to:

- Create releases
- Push commits and tags
- Create pull requests

Ensure the workflow has these permissions (already configured):

```yaml
permissions:
  contents: write
  pull-requests: write
```

### 3. Repository Configuration

Ensure these files exist in `packages/sdk/`:

- `package.json` with correct metadata
- `LICENSE` (MIT license)
- `README.md`
- `CHANGELOG.md`
- `.npmignore`

## 📊 Versioning Strategy

We follow [Semantic Versioning (SemVer)](https://semver.org/):

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0): Breaking changes, incompatible API changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Pre-1.0 Versions (Current: 0.x.y)

While in `0.x.y` versions:

- **Minor** bumps (0.1.0 → 0.2.0) can include breaking changes
- **Patch** bumps (0.1.0 → 0.1.1) should be backward compatible
- Once API stabilizes, bump to `1.0.0`

### Version Lifecycle

```
0.1.0  Initial release
  ↓
0.1.1  Bug fixes (patch)
  ↓
0.2.0  New features (minor)
  ↓
0.2.1  Bug fixes (patch)
  ↓
1.0.0  Stable API (major)
  ↓
1.1.0  New features (minor)
  ↓
2.0.0  Breaking changes (major)
```

## 🚀 Release Process

### Option 1: Manual Release (Immediate)

Use when you need to publish immediately:

1. **Ensure all tests pass:**

   ```bash
   cd packages/sdk
   pnpm test
   pnpm test:e2e
   ```

2. **Commit and push all changes:**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

3. **Trigger workflow:**
   - Go to Actions → "Publish SDK to NPM"
   - Click "Run workflow"
4. **Update CHANGELOG manually (if this was a hotfix):**

   ```bash
   # Edit CHANGELOG.md
   vim packages/sdk/CHANGELOG.md

   # Add entry after header:
   ## [0.1.2] - 2025-11-01

   ### Fixed
   - Critical security vulnerability in XSS sanitizer

   # Commit and push
   git add packages/sdk/CHANGELOG.md
   git commit -m "docs: update CHANGELOG for v0.1.2 hotfix"
   git push origin main
   ```

5. **Verify publication:**
   - Check workflow logs for success
   - Visit https://www.npmjs.com/package/@bugspotter/sdk
   - Test installation: `npm install @bugspotter/sdk@latest`

### Option 2: Automated Release (Recommended)

Use for regular development workflow:

1. **Make changes and commit with conventional format:**

   ```bash
   git add .
   git commit -m "feat: add session replay pause/resume API"
   git push origin main
   ```

2. **Review release PR:**
   - Release Please creates/updates PR automatically
   - Review proposed version bump
   - Review generated CHANGELOG
   - Request changes if needed

3. **Merge release PR:**
   - When ready, merge the release PR
   - Workflow automatically publishes to npm
   - GitHub release created automatically

4. **Verify publication:**
   - Check npm for new version
   - Test installation

## 🎯 Best Practices

### 1. Commit Message Guidelines

- Use conventional commit format consistently
- Be descriptive in commit subjects
- Include scope when applicable: `feat(modal): add close button`
- Reference issues: `fix: resolve memory leak (#123)`

### 2. Testing Before Release

Always test locally before pushing:

```bash
# Run all tests
pnpm test && pnpm test:e2e

# Build and verify artifacts
pnpm build
ls -lh dist/

# Test in example app
cd apps/demo
pnpm dev
```

**Note:** Release Please workflow also runs tests automatically before publishing, providing an additional safety net.

### 3. Dry-Run First

For manual releases, always do a dry-run first:

1. Run workflow with dry-run enabled
2. Review logs for any issues
3. Fix issues if found
4. Run actual publish

### 4. Changelog Maintenance

- Keep `CHANGELOG.md` updated manually for significant changes
- Release Please appends to existing changelog
- Use clear, user-friendly descriptions
- Include migration guides for breaking changes

### 5. Version Bumping

**When to use each bump type:**

- **Patch** (default): Bug fixes, minor improvements, documentation
- **Minor**: New features, significant improvements, non-breaking API additions
- **Major**: Breaking changes, major API redesigns, significant behavioral changes

### 6. Pre-release Testing

Before publishing, test the package:

```bash
# Pack the package locally
cd packages/sdk
npm pack

# Install in test project
cd /path/to/test-project
npm install /path/to/bugspotter-sdk-0.1.0.tgz

# Test all features
npm start
```

## 🔍 Troubleshooting

### NPM Publish Fails

**Error: `ENEEDAUTH`**

- NPM token is missing or invalid
- Regenerate token on npmjs.com
- Update `NPM_TOKEN` secret in GitHub

**Error: `EPUBLISHCONFLICT`**

- Version already published
- Bump version number
- Check if tag already exists: `git tag -l`

**Error: `E403 Forbidden`**

- NPM token lacks publish permissions
- Ensure token type is "Automation"
- Check package scope matches npm account

### Build Fails

**TypeScript errors:**

```bash
# Check for type errors locally
pnpm --filter @bugspotter/sdk run build
```

**Missing dependencies:**

```bash
# Reinstall dependencies
pnpm install --frozen-lockfile
```

**Build artifacts missing:**

```bash
# Verify build scripts in package.json
cat packages/sdk/package.json | grep '"build"'

# Check tsconfig settings
cat packages/sdk/tsconfig.json
```

### Tests Fail in CI

**Tests pass locally but fail in CI:**

- Check Node version match (20)
- Check environment variables
- Review GitHub Actions logs
- Run tests in clean environment: `rm -rf node_modules && pnpm install`

**Playwright tests fail:**

```bash
# Install browsers locally
pnpm --filter @bugspotter/sdk exec playwright install chromium

# Run in headed mode to debug
pnpm --filter @bugspotter/sdk run test:playwright --headed
```

### Release Please Issues

**No release PR created:**

- Check commit messages use conventional format
- Ensure commits are on `main` branch
- Check workflow permissions (contents: write, pull-requests: write)
- Review workflow logs for errors

**Publish job doesn't run after PR merge:**

- Verify `release-please` job has `outputs:` section defined
- Check that `release_created` output is properly exposed
- Review workflow logs for conditional evaluation errors
- Ensure `publish-after-release` job condition matches: `if: needs.release-please.outputs.release_created`

**Wrong version bump:**

- Review commit messages for type
- Use `feat!:` or `BREAKING CHANGE:` for major bumps
- Manually edit release PR if needed

**Duplicate releases:**

- Don't merge release PRs too quickly
- Wait for workflow to complete before creating new commits
- Check existing release PRs before merging

### GitHub Release Creation Fails

**Error: `Resource not accessible by integration`**

- Check `GITHUB_TOKEN` permissions
- Ensure workflow has `contents: write`

**Tag already exists:**

```bash
# List existing tags
git tag -l "sdk-v*"

# Delete tag locally and remotely
git tag -d sdk-v0.1.0
git push origin :refs/tags/sdk-v0.1.0
```

## 📚 Additional Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Release Please Documentation](https://github.com/googleapis/release-please)
- [NPM Publishing Guide](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [CDN Usage Guide](./CDN.md) - User-facing CDN documentation

## 🤝 Contributing

When contributing to the SDK:

1. Follow conventional commit format
2. Write tests for new features
3. Update documentation
4. Test builds locally before pushing
5. Let Release Please handle versioning

---

**Questions?** Open an issue or discussion on GitHub.
