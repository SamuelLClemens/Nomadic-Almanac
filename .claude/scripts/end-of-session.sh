#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# NOMADIC ALMANAC — END-OF-SESSION DEPLOY HOOK
# Runs automatically when a Claude Code session ends.
# Commits any outstanding work, pushes the current branch,
# merges to main, and deploys to GitHub Pages.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJ="/Users/zim/Desktop/Claude Code"
LOG="$PROJ/.claude/scripts/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() { echo "[$TIMESTAMP] $*" | tee -a "$LOG"; }

cd "$PROJ"

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
log "End-of-session deploy — branch: $BRANCH"

# ── 1. Commit any uncommitted changes ────────────────────────────────────────
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  git add -A
  git commit -m "chore: session work ($(date '+%Y-%m-%d %H:%M'))" \
    -m "Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>" \
    && log "Committed outstanding changes" \
    || log "WARN: commit failed — check git status"
else
  log "Working tree clean — nothing to commit"
fi

# ── 2. Push current branch ───────────────────────────────────────────────────
git push origin "$BRANCH" \
  && log "Pushed $BRANCH to origin" \
  || log "WARN: push of $BRANCH failed"

# ── 3. Merge to main and deploy (only if not already on main) ────────────────
if [ "$BRANCH" != "main" ]; then

  # Abort if merge would produce conflicts
  git fetch origin main --quiet
  MERGE_BASE=$(git merge-base "$BRANCH" origin/main)
  if git merge-tree "$MERGE_BASE" "$BRANCH" origin/main | grep -q "^<<<<<<"; then
    log "WARN: conflicts detected — skipping auto-merge to main. Merge manually."
    exit 0
  fi

  git checkout main
  git pull origin main --quiet
  git merge --no-ff "$BRANCH" \
    -m "chore: merge $BRANCH → main (end-of-session deploy $(date '+%Y-%m-%d %H:%M'))" \
    -m "Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

  git push origin main \
    && log "Deployed to main — GitHub Pages will update in ~30s" \
    || log "ERROR: push to main failed"

  git checkout "$BRANCH"
  log "Returned to $BRANCH"

else
  log "Already on main — nothing to merge"
fi

log "Done."
