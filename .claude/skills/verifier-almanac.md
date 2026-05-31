# Nomadic Almanac — Visual Verifier Skill

Use this skill after ANY code change to the Nomadic Almanac project.
It boots the app, drives every key UI surface, captures evidence, and
reports PASS / FAIL with screenshots.

---

## Launch the server

```bash
# Kill any stale server, start fresh
pkill -f "almanac_server" 2>/dev/null; sleep 1
cat > /tmp/almanac_server2.py << 'EOF'
import http.server, os, socketserver
port = int(os.environ.get('PORT', 7433))
os.chdir("/Users/zim/Desktop/Claude Code")
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class S(socketserver.TCPServer):
    allow_reuse_address = True
print(f"Serving on {port}", flush=True)
S(("", port), H).serve_forever()
EOF
python3 /tmp/almanac_server2.py &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:7433/index.html
```

Expected: `200`. If not — server failed, report BLOCKED.

---

## Start preview

Use `preview_start` with server name `nomadic-almanac` (launch.json at
`.claude/launch.json`).  
If the browser lands on `chrome-error://`, navigate via:

```javascript
window.location.href = 'http://localhost:7433/index.html'
```

Wait **8 seconds** for `data.js` (~2.6 MB, ~44 k lines) to parse.

---

## Checklist — drive every surface

Run each check via `preview_eval` or screenshot. Mark ✅ / ❌ / ⚠️.

### 1. Loading overlay
```javascript
// should be null (dismissed) or opacity-0 within 6 s of load
document.getElementById('loading-overlay')?.style.opacity
```
✅ null or `'0'` — ❌ visible with full opacity after 6 s

### 2. Topbar structure
```javascript
({
  topbar:   !!document.getElementById('topbar'),
  row1:     !!document.getElementById('tb-row1'),
  row2:     !!document.getElementById('tb-row2'),
  months:   document.getElementById('months')?.children.length,  // expect 13
  logo:     !!document.getElementById('logo-icon'),
  search:   !!document.getElementById('country-search'),
})
```
✅ topbar/row1/row2 true, months = 13 (12 + ALL YEAR)

### 3. Primary layer buttons visible
```javascript
['weather','safety','cost','internet','visa'].map(k =>
  !!document.querySelector(`.lb[data-key="${k}"]`)
)
```
✅ all true

### 4. More button + dropdown
```javascript
document.getElementById('btn-more-layers')?.textContent
```
✅ `'More ▾'`  

Click More, then check groups:
```javascript
document.getElementById('btn-more-layers').click();
document.getElementById('layers-more-dropdown')?.classList.contains('open')
```
✅ true  
Close by clicking outside, verify `classList.contains('open')` → false.

### 5. Map canvas visible and sized
```javascript
({
  mapTop:    document.getElementById('map')?.style.top,
  leafletOk: typeof L !== 'undefined' && !!window.map,
  tbHeight:  document.getElementById('topbar')?.offsetHeight,
})
```
✅ `leafletOk` true; `mapTop` matches `tbHeight + 'px'`

### 6. Choropleth loads (give it 15 s after overlay dismissal)
Take screenshot — countries should show coloured fills over satellite basemap.

### 7. Country click → tooltip
Use `preview_click` to click the centre of a visible country fill.
```javascript
document.getElementById('tt')?.style.display
```
✅ `'block'`  
Check tooltip has name, rating row, and visa section when Visa layer active.

### 8. Field Guide title updates
```javascript
// Click Safety layer button, then read legend title
document.querySelector('.lb[data-key="safety"]').click();
document.getElementById('legend-title')?.textContent
```
✅ `'🛡 SAFETY'`  
Switch back to weather → `'🌤 WEATHER'`.

### 9. Passport selector + Visa layer
```javascript
const sel = document.getElementById('passport-select');
sel.value = 'US';
sel.dispatchEvent(new Event('change'));
// Visa layer should now be on:
window.activeLayers?.has('visa')
```
✅ true; map re-colours.

### 10. Console errors
```javascript
// Must be zero errors
```
Use `preview_console_logs` with `level: 'error'`.  
✅ 0 errors — ❌ any error is a FAIL.

---

## Report format

```
## Verification: Nomadic Almanac — <short description of change>

**Verdict:** PASS | FAIL | BLOCKED

### Checklist
1. Loading overlay — ✅/❌
2. Topbar structure — ✅/❌  months=N
3. Primary layers — ✅/❌
4. More dropdown — ✅/❌
5. Map / Leaflet — ✅/❌  top=Npx
6. Choropleth — ✅/❌ (screenshot)
7. Click tooltip — ✅/❌
8. Field Guide title — ✅/❌
9. Passport / Visa — ✅/❌
10. Console errors — ✅/❌  N errors

### Findings
<any ⚠️ observations>
```

---

## Known environment notes

- The `preview_start` browser is sandboxed — `XMLHttpRequest` to localhost
  fails from `chrome-error://`. Always navigate explicitly after start.
- `data.js` is ~2.6 MB. Allow 8–12 s for first parse; subsequent reloads
  are faster if the browser has cached it.
- The Esri satellite tile CDN (`arcgisonline.com`) requires network access.
  A black map with no errors usually means the tiles CDN is unreachable or
  slow — not a code bug.
- `fitMapBelowTopbar()` runs before Leaflet initialises; the `if (map)`
  guard is intentional and correct.
