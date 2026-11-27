import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen

PROJECT_DIR = Path(__file__).resolve().parent
ENV_FILE = PROJECT_DIR / ".env.local"


def load_api_key():
    # Read the API key without exposing the configuration file.
    if not ENV_FILE.is_file():
        return ""

    for line in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
        name, separator, value = line.partition("=")
        if separator and name.strip() == "TMDB_API_KEY":
            return value.strip().strip('"').strip("'")

    return ""


class FramecheckHandler(BaseHTTPRequestHandler):
    def send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/search":
            self.search_movies(parsed.query)
            return

        # Serve only the files needed by the application.
        if parsed.path == "/":
            file_path = PROJECT_DIR / "index.html"
        elif parsed.path.startswith("/src/"):
            relative_path = parsed.path.lstrip("/")
            file_path = (PROJECT_DIR / relative_path).resolve()

            if not file_path.is_relative_to(PROJECT_DIR / "src"):
                self.send_error(403)
                return

            if any(part.startswith(".") for part in file_path.relative_to(PROJECT_DIR).parts):
                self.send_error(403)
                return
        else:
            self.send_error(404)
            return

        if not file_path.is_file():
            self.send_error(404)
            return

        content_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".svg": "image/svg+xml",
        }

        content_type = content_types.get(file_path.suffix.lower())
        if not content_type:
            self.send_error(403)
            return

        body = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def search_movies(self, query_string):
        query = parse_qs(query_string).get("query", [""])[0].strip()

        if not query:
            self.send_json(400, {"error": "A search query is required."})
            return

        api_key = load_api_key()
        if not api_key:
            self.send_json(500, {"error": "TMDB API key is not configured."})
            return

        params = urlencode({
            "query": query,
            "language": "en-US",
        })
        url = f"https://api.themoviedb.org/3/search/movie?{params}"
        request = Request(
            url,
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
        )

        try:
            with urlopen(request, timeout=10) as response:
                data = json.load(response)
            self.send_json(200, data)
        except HTTPError as error:
            self.send_json(502, {"error": f"TMDB request failed: HTTP {error.code}."})
        except (URLError, TimeoutError, ValueError):
            self.send_json(502, {"error": "Could not retrieve movie data from TMDB."})


if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", 8000), FramecheckHandler)
    print("Framecheck is running at http://127.0.0.1:8000")
    print("Press Ctrl+C to stop the server.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()