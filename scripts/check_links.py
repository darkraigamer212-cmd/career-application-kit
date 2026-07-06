from html.parser import HTMLParser
from pathlib import Path
import urllib.parse
import urllib.request


ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = [ROOT / "portfolio" / "index.html", ROOT / "portfolio" / "links.html"]


class LinkParser(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source = source
        self.links = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        for key in ("href", "src"):
            if key in data:
                self.links.append((key, data[key]))


def check_local_link(source, url):
    target = url.split("#", 1)[0]
    path = (source.parent / urllib.parse.unquote(target)).resolve()
    return url, path, path.exists()


def check_remote_link(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    request = urllib.request.Request(url, method="HEAD", headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        if exc.code != 405:
            raise
        request = urllib.request.Request(url, method="GET", headers=headers)
        with urllib.request.urlopen(request, timeout=8) as response:
            return response.status


def main():
    local = []
    remote = []
    for html_file in HTML_FILES:
        parser = LinkParser(html_file)
        parser.feed(html_file.read_text(encoding="utf-8"))
        for _, url in parser.links:
            if url.startswith(("mailto:", "tel:", "#")):
                continue
            if url.startswith(("http://", "https://")):
                remote.append(url)
            else:
                local.append(check_local_link(html_file, url))

    print("LOCAL LINKS")
    failed = False
    for url, path, ok in local:
        print(f"{'OK  ' if ok else 'MISS'}{url} -> {path}")
        failed = failed or not ok

    print("REMOTE LINKS")
    for url in sorted(set(remote)):
        try:
            status = check_remote_link(url)
            print(f"OK  {status} {url}")
        except Exception as exc:
            print(f"WARN {url} :: {type(exc).__name__}: {str(exc)[:120]}")

    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
