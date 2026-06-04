/**
 * NOMADIC ALMANAC — PROJECT PREFLIGHT WORKFLOW
 * ─────────────────────────────────────────────
 * Fast smoke-test specific to this project.
 * Call from any NA workflow: await workflow('nomadic-preflight')
 * Or run standalone: /workflows → nomadic-preflight
 *
 * Checks: node path, file sizes, JS brace balance, git state, stale /tmp/na_* files.
 * Returns: PASS / WARN (node missing) / FAIL (files broken)
 * Throws on FAIL — stops any calling workflow immediately.
 */

export const meta = {
  name: 'nomadic-preflight',
  description: 'Nomadic Almanac smoke-test: node path, file integrity, brace balance, git state. Aborts on failure before spending budget.',
  whenToUse: 'Call at the start of any Nomadic Almanac multi-phase workflow, or run standalone to verify project health.',
  phases: [{ title: 'Preflight', detail: 'Node, file sizes, JS brace balance, git, stale /tmp/na_* files' }],
}

const PROJ = '/Users/zim/Desktop/Claude Code'

phase('Preflight')

const result = await agent(`
TASK: Fast health check for the Nomadic Almanac project. Complete ALL checks, report everything.

CHECK 1 — Find node binary:
Run this shell block via Bash:
NODE=$(command -v node 2>/dev/null)
[ -z "$NODE" ] && NODE=$(find /usr/local/bin /opt/homebrew/bin /opt/homebrew/opt/node/bin /usr/bin -maxdepth 3 -name node -type f 2>/dev/null | head -1)
[ -z "$NODE" ] && NODE=$(ls "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | tail -1)
[ -z "$NODE" ] && NODE=$(ls "$HOME"/.volta/bin/node "$HOME"/.asdf/shims/node 2>/dev/null | head -1)
if [ -z "$NODE" ]; then
  echo "node=NOT_FOUND"
  echo "NOT_FOUND" > /tmp/na_node_bin.txt
else
  echo "node=$NODE ($($NODE --version 2>&1))"
  echo "$NODE" > /tmp/na_node_bin.txt
fi

CHECK 2 — Project file line counts (CRITICAL — any zero means broken):
Run: wc -l "${PROJ}/data.js" "${PROJ}/app.js" "${PROJ}/style.css" "${PROJ}/sw.js" "${PROJ}/index.html" 2>&1

CHECK 3 — JS brace balance (CRITICAL — FAIL = integration will corrupt files):
Run: python3 - << 'PYEOF'
results = []
for fn in ['${PROJ}/data.js', '${PROJ}/app.js']:
    try:
        txt = open(fn, encoding='utf-8').read()
        opens = txt.count('{'); closes = txt.count('}')
        po = txt.count('('); pc = txt.count(')')
        so = txt.count('['); sc = txt.count(']')
        ok = (opens == closes) and (po == pc) and (so == sc)
        lines = txt.count('\n')
        results.append(fn.split('/')[-1] + ':' + ('PASS(' + str(lines) + 'L)' if ok else 'FAIL—braces:'+str(opens)+'/'+str(closes)+' parens:'+str(po)+'/'+str(pc)))
    except Exception as e:
        results.append(fn.split('/')[-1] + ':ERROR(' + str(e) + ')')
for r in results:
    print(r)
PYEOF

CHECK 4 — Service worker cache version (informational):
Run: grep -n "CACHE" "${PROJ}/sw.js" 2>/dev/null | head -3

CHECK 5 — Git state:
Run: cd "${PROJ}" && git log --oneline -3 2>/dev/null && echo "---" && git status --short 2>/dev/null | head -10

CHECK 6 — Stale /tmp/na_* build artifacts:
Run: python3 - << 'PYEOF2'
import os, glob
files = sorted(glob.glob('/tmp/na_*.js') + glob.glob('/tmp/na_*.css'))
if files:
    print(str(len(files)) + ' stale artifact(s):')
    for f in files:
        lines = open(f, encoding='utf-8').read().count('\n') if os.path.exists(f) else 0
        print('  ' + f.split('/')[-1] + '  ' + str(lines) + 'L')
else:
    print('no stale /tmp/na_* files')
PYEOF2

DECISION RULES:
- PREFLIGHT FAIL: only if project files are missing (0 lines) OR brace balance FAILS
- PREFLIGHT WARN: node=NOT_FOUND but everything else is OK
- PREFLIGHT PASS: node found AND files OK AND braces PASS

Output exactly one final line in one of these formats:
"PREFLIGHT PASS | node=[version] | data.js=[N]L | app.js=[N]L | braces=PASS | sw=[cache-version] | git=[commit]"
"PREFLIGHT WARN | node=NOT_FOUND | data.js=[N]L | app.js=[N]L | braces=PASS | sw=[cache-version] | git=[commit]"
"PREFLIGHT FAIL | [exact description of what is broken]"
`, { phase: 'Preflight', label: 'na:preflight' })

const resultStr = String(result)
log('NA Preflight: ' + resultStr.slice(0, 300))

if (resultStr.includes('PREFLIGHT FAIL')) {
  throw new Error('Nomadic Almanac preflight failed — aborting. Fix the reported issue before re-running. Details: ' + resultStr)
}

return {
  status: resultStr.includes('PREFLIGHT PASS') ? 'PASS' : 'WARN',
  nodePath: '/tmp/na_node_bin.txt',
  summary: resultStr.slice(0, 300),
}
