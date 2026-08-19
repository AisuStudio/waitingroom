#!/usr/bin/env python3
"""Static server for local work — with caching switched off.

python -m http.server sends no cache headers at all, which browsers read as
"decide for yourself". For ES modules they decide to keep the old one, so an
edited rule keeps rendering its previous text and the page looks broken in a
way that has nothing to do with the change. Half an hour was lost to that
once; this exists so it is not lost again.

    python3 serve.py [port]
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # One line per request is noise while working; errors still surface.
        if not args or not str(args[1]).startswith("2"):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
    handler = partial(NoCacheHandler, directory=".")
    print(f"waitingroom on http://localhost:{port}")
    ThreadingHTTPServer(("", port), handler).serve_forever()
