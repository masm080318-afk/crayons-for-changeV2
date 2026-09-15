"""Check generated HTML, all local destinations, metadata, images and old content."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import hashlib
import base64

ROOT = Path(__file__).resolve().parents[1]
errors = []
external = set()

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = set()
        self.links = []
        self.metas = {}
        self.headings = []
        self.canonical = None
        self.labels = set()
        self.inputs = []
        self.jsonld = ''
        self.in_jsonld = False
        self.title = ''
        self.in_title = False
        self.redirect = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            if a['id'] in self.ids:
                errors.append(f'{self.path}: duplicate ID {a["id"]}')
            self.ids.add(a['id'])
        if tag == 'a' and 'href' in a:
            self.links.append(a['href'])
        if tag in ('script', 'img') and a.get('src'):
            self.links.append(a['src'])
        if tag == 'link' and a.get('href'):
            if a.get('rel') == 'canonical': self.canonical = a['href']
            else: self.links.append(a['href'])
        if tag == 'img':
            if 'alt' not in a: errors.append(f'{self.path}: image missing alt')
            if 'width' not in a or 'height' not in a: errors.append(f'{self.path}: image missing dimensions')
        if tag == 'meta':
            self.metas[a.get('name', a.get('property', a.get('http-equiv', '')))] = a.get('content', '')
            if a.get('http-equiv') == 'refresh': self.redirect = True
        if tag == 'h1': self.headings.append(tag)
        if tag == 'label': self.labels.add(a.get('for'))
        if tag in ('input', 'textarea'): self.inputs.append(a.get('id'))
        if tag == 'script' and a.get('type') == 'application/ld+json': self.in_jsonld = True
        if tag == 'title': self.in_title = True

    def handle_endtag(self, tag):
        if tag == 'script': self.in_jsonld = False
        if tag == 'title': self.in_title = False

    def handle_data(self, value):
        if self.in_jsonld: self.jsonld += value
        if self.in_title: self.title += value

pages = {}
for path in ROOT.rglob('*.html'):
    if '.git' in path.parts or 'node_modules' in path.parts: continue
    p = Page(path.relative_to(ROOT))
    content = path.read_text()
    p.feed(content)
    pages[path] = p
    for forbidden in ('116+', 'page-transition', 'Playfair', 'November 15', '$25', 'Every dollar goes'):
        if forbidden in content: errors.append(f'{p.path}: obsolete content {forbidden}')
    if not p.redirect:
        if len(p.headings) != 1: errors.append(f'{p.path}: expected exactly one h1')
        for key in ('description', 'viewport', 'og:title', 'og:description', 'og:image', 'og:url'):
            if not p.metas.get(key): errors.append(f'{p.path}: missing {key}')
        if not p.canonical or not p.title: errors.append(f'{p.path}: missing title/canonical')
        if any(field not in p.labels for field in p.inputs): errors.append(f'{p.path}: unlabelled input')
        try:
            structured = json.loads(p.jsonld)
            assert structured['@type'] == 'NGO'
            digest = base64.b64encode(hashlib.sha256(p.jsonld.encode()).digest()).decode()
            assert f"'sha256-{digest}'" in p.metas['Content-Security-Policy']
        except (ValueError, KeyError, AssertionError): errors.append(f'{p.path}: invalid structured data or CSP hash')

for path, p in pages.items():
    for link in p.links:
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc:
            if parsed.scheme == 'https': external.add(link)
            continue
        local = ROOT / unquote(parsed.path).lstrip('/') if parsed.path.startswith('/') else path.parent / unquote(parsed.path)
        if not parsed.path: local = path
        if local.is_dir(): local = local / 'index.html'
        if not local.exists(): errors.append(f'{p.path}: missing {link}')
        elif parsed.fragment and local in pages and unquote(parsed.fragment) not in pages[local].ids:
            errors.append(f'{p.path}: missing anchor {link}')
print(f'Checked {len(pages)} HTML files, local links, metadata, labels, image dimensions and structured data.')
print('External destinations:')
for link in sorted(external): print(link)
for error in errors: print('ERROR:', error)
raise SystemExit(bool(errors))
