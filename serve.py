#!/usr/bin/env python3
"""Local dev server for the static site: `python3 serve.py [port]`.

Port order: $PORT (set by preview tools that pick a free port), then the argument, then 7432.
"""
import http.server
import os
import sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))
port = int(os.environ.get("PORT") or (sys.argv[1] if len(sys.argv) > 1 else 7432))


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def end_headers(self):
        # Dev only: never let the browser reuse a stale copy while files are being edited.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
