# Dependabot Security Updates and Automerge Design Spec

## 1. Context & Objectives
The repository currently has open Dependabot pull requests (#106, #107, #108, #109) in a `CONFLICTING` state because PR #105 merged first and updated `package-lock.json`. Due to the merge conflicts, GitHub Actions CI workflows did not run on the remaining PRs.
Additionally, the repository requires:
- Enabling Dependabot security PRs (automated security fixes).
- Configuring Dependabot groups for security updates:
  - `security` (patch and minor updates)
  - `security-major` (major updates)
- Aligning `dependabot.yml` with the pattern from `mercadona/mo.boilerplate.react-vite` (including `cooldown` and `versioning-strategy: increase`).
- Ensuring `.github/workflows/dependabot-automerge.yml` auto-merges minor and patch updates as well as the `security` group when CI passes.

---

## 2. GitHub Repository Configuration
- Run GitHub CLI command to enable automated security fixes:
  ```bash
  gh api -X PUT /repos/yabbadabbadev/react-boilerplate/automated-security-fixes
  ```
- Verify status via `gh api /repos/yabbadabbadev/react-boilerplate/automated-security-fixes` (expecting `"enabled": true`).

---

## 3. Dependabot Configuration (`.github/dependabot.yml`)
Update `.github/dependabot.yml`:
- Set `versioning-strategy: increase`.
- Set `open-pull-requests-limit: 10`.
- Add `cooldown`:
  ```yaml
  cooldown:
    default-days: 7
    semver-major-days: 14
    semver-minor-days: 7
    semver-patch-days: 3
    exclude:
      - "@yabbadabbadev/*"
  ```
- Configure groups for `npm`:
  - `security`: `applies-to: security-updates`, `update-types: ["minor", "patch"]`, `patterns: ["*"]`
  - `security-major`: `applies-to: security-updates`, `update-types: ["major"]`, `patterns: ["*"]`
  - Existing functional groups for version updates:
    - `react` (`react`, `react-dom`, `react-router`, `@types/react*`)
    - `vite` (`vite`, `@vitejs/*`, `vite-*`)
    - `oxlint` (`oxlint*`)
    - `prettier` (`prettier`)
    - `testing` (`@yabbadabbadev/pepito`, `vitest-browser-react`, `@vitest/browser*`, `playwright`, `msw`, `vitest`)
- Keep `github-actions` ecosystem with `actions` group (`patterns: ["*"]`).

---

## 4. Automerge Workflow (`.github/workflows/dependabot-automerge.yml`)
Update the step `Approve and enable auto-merge for patch and minor updates`:
- Extend condition to approve and enable auto-merge when:
  ```yaml
  (steps.metadata.outputs.update-type == 'version-update:semver-patch' ||
   steps.metadata.outputs.update-type == 'version-update:semver-minor' ||
   steps.metadata.outputs.dependency-group == 'security') &&
  steps.peers.outputs.changed == 'false'
  ```
- Retain peer dependency check and safe permissions (`contents: write`, `pull-requests: write`).

---

## 5. Resolution Strategy for Conflicting PRs (#106 - #109)
- Once the updated configuration is merged to `main`, the existing PRs will be rebased sequentially using `@dependabot rebase` or manually merged/rebased to clear the lockfile conflict queue.
