# Contributing to Attyre

Thanks for wanting to help out! This doc covers everything you need to get up and running, from setting up locally to getting a PR merged.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Local Development](#local-development)
- [Branching Strategy](#branching-strategy)
- [Making a Change](#making-a-change)
- [Pull Request Guidelines](#pull-request-guidelines)
- [CI Checks](#ci-checks)
- [Deployment to Production](#deployment-to-production)

---

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Local Development

Attyre is a static client-side app with no build step — the files are served as-is.

### Prerequisites

- Python 3 (for the local dev server — comes pre-installed on macOS and most Linux distros)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/aetherassembly/attyre.git
cd attyre

# 2. Start a local dev server
python3 -m http.server 8000
```

The app will be available at `http://localhost:8000`.

> **Note:** The Suggest Outfit feature calls OpenStreetMap Nominatim and Open-Meteo from your browser directly. These work in local dev with no extra config, but if you make frequent requests you may hit provider rate limits (especially Nominatim), and occasional transient CORS/request failures can occur. If that happens, slow down request frequency and retry after a short wait.

---

## Branching Strategy

We use a simple trunk-based flow:

```bash
main                    ← production, always deployable
├── feature/my-thing    ← new features
├── fix/bug-description ← bug fixes
├── chore/some-task     ← refactors, dependency updates, docs
└── hotfix/urgent-fix   ← urgent production fixes (branch from main, PR back to main)
```

### Branch naming

| Type | Pattern | Example |
| ---- | ------- | ------- |
| Feature | `feature/<short-description>` | `feature/stats-page` |
| Bug fix | `fix/<short-description>` | `fix/calendar-date-offset` |
| Chore | `chore/<short-description>` | `chore/update-lzstring` |
| Hotfix | `hotfix/<short-description>` | `hotfix/broken-suggest-api` |

Keep branch names lowercase with hyphens.

---

## Making a Change

1. **Create a branch** off `main`:

   ```bash
   git checkout main
   git pull
   git checkout -b feature/your-thing
   ```

2. **Make your changes.** Keep commits focused and descriptive:

   ```bash
   git commit -m "feat: add warmth filter to stats page"
   ```

   We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — new feature
   - `fix:` — bug fix
   - `chore:` — maintenance, refactors, docs
   - `style:` — visual/CSS only changes
   - `perf:` — performance improvement

3. **Push your branch:**

   ```bash
   git push -u origin feature/your-thing
   ```

4. **Open a pull request** against `main`.

---

## Pull Request Guidelines

- **One PR, one concern.** Don't bundle unrelated changes.
- **Fill out the PR description** — what changed, why, and how to test it.
- **Link any related issues** using `Closes #123` or `Relates to #123`.
- **Keep PRs reasonably sized.** Large PRs are hard to review. If you're adding a big feature, consider splitting it into smaller steps.
- **Don't force-push** to a branch that already has a PR open — it breaks review history.

### PR checklist

Before marking your PR as ready for review:

- [ ] Tested in a browser (Chrome + one other)
- [ ] Tested on mobile viewport
- [ ] Dark mode still looks okay
- [ ] Accessibility mode still looks okay
- [ ] No `console.error` spam in devtools
- [ ] If you touched `store.js`: verified export/import still works
- [ ] If you touched `engine.js`: verified suggest output makes sense
- [ ] Updated `CHANGELOG.md` if this is a user-facing change

---

## CI Checks

Every PR automatically runs a smoke test via GitHub Actions — no secrets or credentials needed. It:

- Spins up a `python3 -m http.server` and verifies every static file, JS module, and asset returns 200
- Validates `manifest.json` is well-formed JSON
- Confirms `APP_VERSION` is present and correctly formatted in `js/app.js`

Results are posted as a comment on the PR and updated on every new push. If a check fails, click "view run" in the comment to see exactly which file failed.

---

## Deployment to Production

Merging to `main` triggers an automatic deployment via Cloudflare's GitHub integration — nothing to configure or run manually. Once your PR is merged, the live site at [attyre.aetherassembly.org](https://attyre.aetherassembly.org) updates within a minute or two.

If a deploy looks broken after merging, check the Cloudflare dashboard for build logs.

---

## Questions?

Open a GitHub issue, or reach out at [support@aetherassembly.org](mailto:support@aetherassembly.org).
