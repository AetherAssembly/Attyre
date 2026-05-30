# Security Policy

## Supported Versions

Security fixes are applied to the current release and the two most recent releases.

| Version | Status |
| - | - |
| v3.0.0 | ✅ Active support |
| v2.0.1 | ✅ Active support |
| < v2.0.1 | ❌ Not supported |

As new versions are released, this table will be updated to reflect the current support window. Versions outside the support window are no longer actively patched.

## Reporting a Vulnerability

Please do not disclose security vulnerabilities in public issues.

Use GitHub private vulnerability reporting if enabled for this repository, or contact us through one of the following:

- **Email:** [support@aetherassembly.org](mailto:support@aetherassembly.org)
- **Contact form:** [https://forms.gle/T4i7GGzaT3HUrffm9](https://forms.gle/T4i7GGzaT3HUrffm9)
- **Aster (GitHub):** [@Aster1630](https://github.com/Aster1630)
- **Ollie (GitHub):** [@OllieMochi](https://github.com/olliemochi)

Please include in your report:

- A clear description of the issue
- Steps to reproduce
- Impact assessment
- Any suggested remediation or workaround

You can expect an initial acknowledgement within 7 days of receipt.

## Scope

Attyre is a client-side browser application. The most relevant security areas are:

- localStorage data handling and XSS prevention
- Third-party API usage (OpenStreetMap Nominatim, Open-Meteo)
- PWA service worker behavior and cache integrity
- Dependency vulnerabilities in the JavaScript toolchain

## Non-Security Issues

General bugs, feature requests, and compatibility issues should be reported through the normal issue tracker.
