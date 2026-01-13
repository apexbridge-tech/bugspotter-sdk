name: Bug report
about: Create a report to help us improve the SDK
title: '[Bug]: '
labels: ['bug', 'triage']
assignees: ''

---

## Bug Description
A clear and concise description of what the bug is.

## Environment
- **SDK Version**: [e.g. 0.3.0]
- **Browser**: [e.g. Chrome 120, Firefox 119]
- **OS**: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
- **Framework**: [e.g. React 18, Vue 3, Vanilla JS]
- **Bundler**: [e.g. Vite, Webpack, Rollup]

## Steps to Reproduce
1. Initialize SDK with config...
2. Call specific method...
3. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
A clear and concise description of what actually happened.

## Code Sample
```javascript
// Minimal code sample to reproduce the issue
import { BugSpotter } from '@bugspotter/core';

const bugSpotter = new BugSpotter({
  apiKey: 'your-api-key',
  endpoint: 'https://your-endpoint.com'
});

// Code that causes the issue...
```

## Screenshots/Recordings
If applicable, add screenshots or session recordings to help explain your problem.

## Error Messages
```
Paste any console errors, stack traces, or error messages here
```

## Additional Context
Add any other context about the problem here.

## Checklist
- [ ] I have searched for existing issues
- [ ] I have provided a minimal code sample
- [ ] I have included environment information
- [ ] I have checked the browser console for errors