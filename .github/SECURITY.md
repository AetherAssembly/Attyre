# Security Policy

## Supported Versions

Security fixes are applied to the current release and the two most recent releases.

| Version | Status |
| - | - |
| v4.2.0 | ✅ Active support |
| v4.1.0 | ✅ Active support |
| < v4.1.0 | ❌ Not supported |

As new versions are released, this table will be updated to reflect the current support window. Versions outside the support window are no longer actively patched.

## Reporting a Vulnerability

Please do not disclose security vulnerabilities in public issues.

Use GitHub private vulnerability reporting if enabled for this repository, or contact us through one of the following:

- **Email:** [support@aetherassembly.org](mailto:support@aetherassembly.org)
- **Contact form:** [https://forms.gle/T4i7GGzaT3HUrffm9](https://forms.gle/T4i7GGzaT3HUrffm9)
- **Aster (GitHub):** [@Aster1630](https://github.com/Aster1630)

Please include in your report:

- A clear description of the issue
- Steps to reproduce
- Impact assessment
- Any suggested remediation or workaround

You can expect an initial acknowledgement within 7 days of receipt.

## Scope

Attyre runs as an Electron desktop app. The most relevant security areas are:

- localStorage data handling and XSS prevention
- Electron contextBridge and IPC surface (renderer-to-main communication)
- Custom `app://` protocol and filesystem image access on desktop
- Third-party API usage (OpenStreetMap Nominatim, Open-Meteo)
- Dependency vulnerabilities in the JavaScript toolchain

## Non-Security Issues

General bugs, feature requests, and compatibility issues should be reported through the normal issue tracker.
