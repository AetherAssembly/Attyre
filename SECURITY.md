# Security Policy

## Supported Versions

Security fixes are applied to the current release and the two most recent major versions.

- 1.5.x: ✅ Active support
- 1.4.x: ✅ Active support
- 1.3.x: ✅ Active support
- < 1.3.0: ❌ Not supported

As new versions are released, this table will be updated to reflect the current support window. Versions that fall outside the two-major-version window enter deprecated status and are acknowledged but no longer actively patched. Versions older than that are archived to cold storage. Retrieval of archived versions is available as a paid service; contact us at [support@aetherassembly.org](mailto:support@aetherassembly.org) for details.

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
