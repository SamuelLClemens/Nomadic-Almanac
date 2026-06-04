# /safeguard

Run a full health check on the Nomadic Almanac project. Use this any time you are unsure about the state of the codebase, before starting a new build, or after something goes wrong.

**What it checks:**
- Node binary path (resolves across nvm, volta, homebrew, asdf)
- Line counts on all core files (data.js, app.js, style.css, sw.js, index.html)
- Brace/paren/bracket balance on data.js and app.js
- Service worker cache version
- Git log and working-tree status
- Stale /tmp/na_* build artifacts from previous workflow runs

**When to run:**
- Before launching any multi-phase workflow
- After a workflow fails or is interrupted
- When you are unsure if the last build completed cleanly
- When handing work off to another team member

Run the Nomadic Almanac preflight workflow now and report the full results.
Use the saved workflow: invoke `workflow('nomadic-preflight')` via the Workflow tool,
OR run it as a standalone agent with the full check instructions from `.claude/workflows/nomadic-preflight.js`.

Report back in a clean table:

| Check | Result |
|---|---|
| Node binary | |
| data.js | lines, brace balance |
| app.js | lines, brace balance |
| style.css | lines |
| sw.js | cache version |
| Git | last commit, clean/dirty |
| Stale /tmp/na_* | count and list |

If anything is FAIL: describe the exact issue and the fastest fix.
If everything is PASS or WARN: confirm the project is safe to build on.
