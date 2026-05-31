#!/usr/bin/env python3
import http.server
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
port = int(os.environ.get("PORT", 7433))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

server = http.server.HTTPServer(("0.0.0.0", port), Handler)
server.serve_forever()
