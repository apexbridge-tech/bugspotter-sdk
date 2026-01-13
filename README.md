# BugSpotter SDK

A professional bug reporting SDK with session replay capabilities for web applications.

## Features

- 📸 **Automatic Screenshots** - Capture screenshots on errors
- 🎬 **Session Replay** - Record and replay user sessions using rrweb
- 🔄 **Offline Support** - Queue reports when offline, sync when online
- 📤 **File Uploads** - Support for screenshots, logs, and attachments
- 🏗️ **Framework Agnostic** - Works with React, Vue, Angular, and vanilla JS
- 📊 **Minimal Bundle Size** - ~99KB gzipped
- 🔒 **Privacy First** - PII detection and sanitization

## Quick Start

```bash
npm install @bugspotter/sdk
```

```javascript
import { BugSpotter } from '@bugspotter/sdk';

const bugSpotter = new BugSpotter({
  apiKey: 'your-api-key',
  endpoint: 'https://your-bugspotter-instance.com'
});

bugSpotter.init();
```

## Packages

- **[@bugspotter/sdk](./packages/core)** - Core SDK functionality

## Examples

- **[React](./examples/react)** - React integration example
- **[Vue](./examples/vue)** - Vue.js integration example  
- **[Vanilla JS](./examples/vanilla)** - Vanilla JavaScript example

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

## Documentation

See the [packages/core README](./packages/core/README.md) for detailed API documentation and usage examples.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## License

MIT - see [LICENSE](./LICENSE) file for details.