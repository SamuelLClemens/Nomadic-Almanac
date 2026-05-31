# AI Travel Assistant — Design Document

## 1. Feature Goals

- Natural-language Q&A about travel conditions shown on the map
- Context-aware: knows the user's currently selected country, month, and active data layer
- Near-zero cost: Cloudflare Workers free tier + claude-haiku-3-5

---

## 2. Architecture

```
Browser ──HTTPS──> Cloudflare Worker ──HTTPS──> Anthropic API
```

Nomadic Almanac is a static GitHub Pages site. There is no server-side runtime available in the repository — all files are plain HTML, CSS, and JavaScript served directly from GitHub. This means the Anthropic API cannot be called directly from the browser without exposing the API key in client-side code, where any visitor could extract it.

A Cloudflare Worker acts as a thin, authenticated proxy. The browser sends a POST request to the Worker endpoint over HTTPS. The Worker reads the `ANTHROPIC_API_KEY` from a Cloudflare environment secret (set once in the dashboard or via `wrangler secret put` — it is never written into any file) and forwards the request to the Anthropic Messages API. The response streams back to the browser. The API key is never present in any repo file, build artifact, or browser memory.

---

## 3. Cloudflare Worker Design

```javascript
// worker.js — Cloudflare Worker proxy for Anthropic API
// Deploy via: wrangler deploy
// Secrets required:
//   wrangler secret put ANTHROPIC_API_KEY
//   wrangler secret put ALLOWED_ORIGIN

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 3600; // 1 hour

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN; // e.g. https://username.github.io

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(allowedOrigin, origin),
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Enforce CORS origin
    if (origin !== allowedOrigin) {
      return new Response("Forbidden", { status: 403 });
    }

    // Rate limit per IP using Cloudflare KV
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const kvKey = `ratelimit:${ip}`;
    const currentStr = await env.RATE_LIMIT_KV.get(kvKey);
    const current = currentStr ? parseInt(currentStr, 10) : 0;

    if (current >= RATE_LIMIT_REQUESTS) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(allowedOrigin, origin),
          },
        }
      );
    }

    // Increment rate limit counter (set expiry on first write)
    const newCount = current + 1;
    await env.RATE_LIMIT_KV.put(kvKey, String(newCount), {
      expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
    });

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON", 400, allowedOrigin, origin);
    }

    const { messages, context } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return errorResponse("messages array is required", 400, allowedOrigin, origin);
    }

    // Sanitize user messages
    const sanitizedMessages = messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: sanitizeInput(String(msg.content ?? "")),
    }));

    // Build context string for system prompt injection
    const contextNote = buildContextNote(context);

    const systemPrompt = buildSystemPrompt(contextNote);

    // Forward to Anthropic Messages API with streaming
    let anthropicResponse;
    try {
      anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 512,
          system: systemPrompt,
          messages: sanitizedMessages,
          stream: true,
        }),
      });
    } catch (err) {
      return errorResponse("Upstream request failed", 500, allowedOrigin, origin);
    }

    if (!anthropicResponse.ok) {
      return errorResponse("Upstream API error", 500, allowedOrigin, origin);
    }

    // Stream response back to browser
    return new Response(anthropicResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        ...corsHeaders(allowedOrigin, origin),
      },
    });
  },
};

function corsHeaders(allowedOrigin, requestOrigin) {
  if (requestOrigin !== allowedOrigin) return {};
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function errorResponse(message, status, allowedOrigin, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(allowedOrigin, origin),
    },
  });
}

function sanitizeInput(text) {
  // Strip HTML tags, truncate to 500 characters
  return text.replace(/<[^>]*>/g, "").slice(0, 500);
}

function buildContextNote(context) {
  if (!context) return "";
  const parts = [];
  if (context.country) parts.push(`Country: ${context.country}`);
  if (context.month) parts.push(`Month: ${context.month}`);
  if (context.layer) parts.push(`Active layer: ${context.layer}`);
  return parts.length > 0 ? `\n\nCurrent map context — ${parts.join(" · ")}` : "";
}

function buildSystemPrompt(contextNote) {
  return `You are a concise travel conditions advisor for the Nomadic Almanac map application.

RATING SCALE (used on the map):
  0 = Excellent   — ideal travel conditions
  1 = Acceptable  — minor inconveniences, generally fine
  2 = Challenging — significant weather or comfort issues
  3 = Harsh       — strongly inadvisable for most travellers

YOUR ROLE:
- Answer questions about travel conditions, climate, and best travel times.
- Reference the map rating scale when relevant.
- Be specific to the user's selected country and month when that context is available.
- Stay on-topic: travel conditions, weather, climate, and what to expect on the ground.
- Do NOT advise on flight booking, hotel recommendations, visa requirements, or safety/security.
- Keep answers to 150 words or fewer. Be direct and practical.${contextNote}`;
}
```

### Wrangler configuration (`wrangler.toml`)

```toml
name = "nomadic-almanac-ai-proxy"
main = "worker.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "<your-kv-namespace-id>"
```

---

## 4. System Prompt Draft

The following system prompt is injected by the Worker on every request. The `contextNote` block is appended dynamically based on the user's current map state (see Section 3, `buildSystemPrompt`).

```
You are a concise travel conditions advisor for the Nomadic Almanac map application.

RATING SCALE (used on the map):
  0 = Excellent   — ideal travel conditions
  1 = Acceptable  — minor inconveniences, generally fine
  2 = Challenging — significant weather or comfort issues
  3 = Harsh       — strongly inadvisable for most travellers

YOUR ROLE:
- Answer questions about travel conditions, climate, and best travel times.
- Reference the map rating scale when relevant.
- Be specific to the user's selected country and month when that context is available.
- Stay on-topic: travel conditions, weather, climate, and what to expect on the ground.
- Do NOT advise on flight booking, hotel recommendations, visa requirements, or safety/security.
- Keep answers to 150 words or fewer. Be direct and practical.

Current map context — Country: Morocco · Month: July · Active layer: Weather
```

The final line is injected dynamically; it is absent when no country has been selected.

---

## 5. UI Design

### Layout

- **Panel:** collapsible right sidebar, 300 px wide, full map height on desktop
- **Toggle:** "Ask AI" button in the existing menu bar — clicking it opens/closes the panel
- **Messages:** user messages right-aligned (distinct background); assistant messages left-aligned
- **Footer:** fixed-to-panel text input and Send button; Enter key submits
- **Thinking state:** animated ellipsis displayed as `Thinking…` while awaiting the first token
- **Context chip:** small badge at the top of the panel reading `Asking about: Morocco · July · Weather` — updates reactively as the user changes map state
- **Mobile:** panel slides up from bottom of viewport, full viewport width, ~50 vh tall

### HTML skeleton

```html
<!-- In index.html, appended before </body> -->
<div id="ai-panel" class="ai-panel ai-panel--closed" aria-label="AI Travel Assistant">
  <div class="ai-panel__header">
    <span class="ai-panel__title">AI Travel Assistant</span>
    <span id="ai-context-chip" class="ai-context-chip"></span>
    <button id="ai-close-btn" class="ai-close-btn" aria-label="Close">✕</button>
  </div>
  <div id="ai-messages" class="ai-messages" role="log" aria-live="polite"></div>
  <div class="ai-panel__footer">
    <input
      id="ai-input"
      type="text"
      maxlength="500"
      placeholder="Ask about travel conditions…"
      autocomplete="off"
    />
    <button id="ai-send-btn">Send</button>
  </div>
</div>
```

### CSS sketch

```css
.ai-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.25s ease;
}
.ai-panel--closed { transform: translateX(100%); }

.ai-context-chip {
  font-size: 0.7rem;
  background: #e8f4f8;
  border-radius: 999px;
  padding: 2px 8px;
  color: #2a6496;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-msg--user {
  align-self: flex-end;
  background: #0078d4;
  color: #fff;
  border-radius: 12px 12px 2px 12px;
  padding: 8px 12px;
  max-width: 85%;
}

.ai-msg--assistant {
  align-self: flex-start;
  background: #f1f1f1;
  border-radius: 12px 12px 12px 2px;
  padding: 8px 12px;
  max-width: 85%;
}

.ai-thinking::after {
  content: "";
  animation: ellipsis 1.2s infinite;
}
@keyframes ellipsis {
  0%   { content: "Thinking."; }
  33%  { content: "Thinking.."; }
  66%  { content: "Thinking..."; }
}

/* Mobile */
@media (max-width: 640px) {
  .ai-panel {
    top: auto;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    height: 50vh;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
  }
  .ai-panel--closed { transform: translateY(100%); }
}
```

---

## 6. Implementation Checklist

1. Create a Cloudflare account (free tier) and install `wrangler` CLI (`npm i -g wrangler` or use the dashboard).
2. Create a KV namespace: `wrangler kv:namespace create RATE_LIMIT_KV` and paste the returned ID into `wrangler.toml`.
3. Set the API key secret: `wrangler secret put ANTHROPIC_API_KEY` — paste the key at the prompt. It is stored encrypted in Cloudflare and never written to disk.
4. Set the origin secret: `wrangler secret put ALLOWED_ORIGIN` — paste the GitHub Pages URL (e.g., `https://username.github.io`).
5. Deploy the Worker: `wrangler deploy`. Note the `*.workers.dev` URL returned.
6. Add `const WORKER_URL = "https://nomadic-almanac-ai-proxy.<account>.workers.dev";` to `app.js` — this is the only new constant required in the client-side code. It is not a secret.
7. Add the chat panel HTML from Section 5 to `index.html` before `</body>`.
8. Add the chat CSS from Section 5 to the existing `<style>` block in `index.html`.
9. Add chat JavaScript to `app.js`:
   - On Send / Enter: read `#ai-input`, append a user message bubble, POST to `WORKER_URL` with `{ messages, context }`, stream the response into an assistant bubble, update the context chip.
   - Inject current `{ country, month, layer }` state from the existing map globals.
10. Smoke-test from the browser console: `fetch(WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: "Is July good for Morocco?" }], context: { country: "Morocco", month: "July", layer: "Weather" } }) }).then(r => r.text()).then(console.log)`.
11. Commit only `index.html` and `app.js` — do not commit `worker.js` or `wrangler.toml` to the main repo unless the Worker source is kept in a separate private repository.
12. Push to the `main` branch to trigger GitHub Pages deployment.

---

## 7. Cost Estimate

| Item | Detail | Cost |
|---|---|---|
| Cloudflare Workers | Free tier: 100,000 requests/day | $0.00 |
| Cloudflare KV | Free tier: 100,000 reads/day, 1,000 writes/day | $0.00 |
| claude-haiku-4-5 input | $0.80 per million tokens | — |
| claude-haiku-4-5 output | $4.00 per million tokens | — |
| Tokens per conversation | ~2,000 input · ~300 output | — |
| Cost per conversation | (2,000 × $0.0000008) + (300 × $0.000004) | **~$0.003** |
| 500 conversations/month | 500 × $0.003 | **~$1.50/month** |

At 2,000 conversations/month the estimated cost remains under $6.00/month, well within a modest budget. Cloudflare infrastructure costs remain zero under normal traffic.

---

## 8. Security Checklist

- [ ] API key stored only in Cloudflare environment variables — never written to any repo file, `.env`, or client-side code
- [ ] CORS `Access-Control-Allow-Origin` restricted to the exact GitHub Pages origin — all other origins receive `403`
- [ ] Rate limiting enforced per IP address via Cloudflare KV (10 requests per IP per hour)
- [ ] User input sanitised: HTML tags stripped, messages truncated to 500 characters before forwarding
- [ ] No user PII (IP address, message content) written to any persistent log by the Worker
- [ ] Worker source code is safe to make public — it contains no secrets; all sensitive values are injected at runtime via Cloudflare secrets
- [ ] `ALLOWED_ORIGIN` is a Cloudflare secret (not hardcoded) so it can be updated without a code deploy
- [ ] Upstream errors from the Anthropic API return a generic `500` to the browser — no raw API error messages are forwarded
