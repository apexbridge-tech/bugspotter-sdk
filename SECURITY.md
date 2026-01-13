# Security Policy

## Supported Versions

We provide security updates for the following versions of BugSpotter SDK:

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| < 0.3   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in the BugSpotter SDK, please report it to us privately.

### How to Report

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Send an email to security@apexbridge.tech with:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Any suggested fixes (optional)

### Response Timeline

- **Acknowledgment**: We'll acknowledge your report within 48 hours
- **Assessment**: We'll provide an initial assessment within 1 week
- **Fix Timeline**: Critical vulnerabilities will be patched within 2 weeks
- **Disclosure**: We'll coordinate responsible disclosure with you

### Security Best Practices

When using the BugSpotter SDK:

1. **API Key Security**:
   - Never expose API keys in client-side code
   - Use environment variables for configuration
   - Rotate API keys regularly

2. **Data Privacy**:
   - Configure PII detection appropriately
   - Review captured data for sensitive information
   - Implement proper data retention policies

3. **Content Security Policy**:
   - Include appropriate CSP headers
   - Whitelist necessary domains for the SDK

4. **Dependencies**:
   - Keep the SDK updated to the latest version
   - Monitor security advisories for dependencies

## Security Features

The BugSpotter SDK includes several security features:

- **PII Detection**: Automatic detection and sanitization of personally identifiable information
- **Content Sanitization**: XSS protection in captured content
- **Secure Uploads**: Encrypted transmission of screenshots and session data
- **Input Validation**: Strict validation of all user inputs

## Bug Bounty

We currently do not have a formal bug bounty program, but we appreciate responsible disclosure and will acknowledge security researchers who help improve our security.