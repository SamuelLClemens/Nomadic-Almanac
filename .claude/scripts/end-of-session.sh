#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# NOMADIC ALMANAC — END-OF-SESSION HOOK (branch + PR workflow)
# Runs automatically when a Claude Code session ends.
#
# POLICY: This hook commits outstanding work on the CURRENT FEATURE BRANCH,
# pushes that branch, and ensures an open pull request to main. It MUST NOT
# check out main, merge into main, or push main. Merging the PR (and the
# resulting GitHub Pages deploy) is a human decision — never automated.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJ="/Users/zim/Desktop/Claude Code"
LOG="/tmp/na_deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() { echo "[$TIMESTAMP] $*" | tee -a "$LOG"; }

cd "$PROJ"

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
log "End-of-session (branch + PR workflow) — branch: $BRANCH"

# ── 1. Commit any uncommitted changes ────────────────────────────────────────
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  git add -A
  git commit -m "chore: session work ($(date '+%Y-%m-%d %H:%M'))" \
    -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>" \
    && log "Committed outstanding changes" \
    || log "WARN: commit failed — check git status"
else
  log "Working tree clean — nothing to commit"
fi

# ── 2. Refuse to operate on main directly ────────────────────────────────────
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "unknown" ]; then
  log "On '$BRANCH' — refusing to auto-commit or deploy to main. Use a feature branch."
  exit 0
fi

# ── 3. Push the feature branch ───────────────────────────────────────────────
git push -u origin "$BRANCH" \
  && log "Pushed $BRANCH to origin" \
  || log "WARN: push of $BRANCH failed (network/auth) — nothing else to do"

# ── 4. Ensure an open PR to main — NO merge, NO push to main ─────────────────
if command -v gh >/dev/null 2>&1; then
  if gh pr view "$BRANCH" --json number >/dev/null 2>&1; then
    URL=$(gh pr view "$BRANCH" --json url -q .url 2>/dev/null || echo "")
    log "PR already open for $BRANCH  $URL"
  else
    gh pr create --base main --head "$BRANCH" \
      --title "Session work: $BRANCH" \
      --body "Automated end-of-session pull request. Review the diff and merge to deploy to GitHub Pages. main is never modified automatically." \
      && log "Opened PR $BRANCH → main" \
      || log "WARN: gh pr create failed (often: no diff vs main yet, or gh not authenticated). Branch is pushed; open the PR manually if needed."
  fi
else
  log "gh CLI not found — feature branch is pushed. Open the PR to main manually."
fi

log "Done. main left untouched; merge the PR when you are ready to deploy."
