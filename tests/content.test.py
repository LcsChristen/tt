"""Structural checks and responsive-image byte estimates, not a browser audit."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import json, re, hashlib
from PIL import Image

root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text()
css = (root / 'styles.css').read_text()
js = (root / 'script.js').read_text()

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.nodes = []
    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))

p = Parser(); p.feed(html)
ids = [attrs['id'] for tag, attrs in p.nodes if 'id' in attrs]
assert len(ids) == len(set(ids))
links = [attrs for tag, attrs in p.nodes if tag == 'a']
for attrs in links:
    href = attrs['href']
    if href.startswith('#'): assert href[1:] in ids
    if attrs.get('target') == '_blank': assert 'noopener' in attrs.get('rel', '')
    if 'wa.me/' in href: assert urlparse(href).path == '/5554991381775'
assert any(x['href'] == 'tel:+5554991381775' for x in links)
assert len(re.findall(r'<h1\b', html)) == 1
assert 'Assistência técnica de computadores e notebooks em' in html
assert 'Seu computador, de volta ao seu ritmo.' in html
assert 'id="conteudo" tabindex="-1"' in html
assert len(re.findall(r'<details>', html)) == 6
url = 'https://lcschristen.github.io/tt/'
assert ('link', {'rel': 'canonical', 'href': url}) in p.nodes
meta = {a.get('property'): a.get('content') for t, a in p.nodes if t == 'meta'}
assert meta['og:url'] == url
assert meta['og:image'] == url + 'motherboard.webp'
assert meta['og:image:alt']
data = json.loads(re.search(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', html, re.S).group(1))
assert data['url'] == url and data['@id'] == url + '#negocio'
assert data['image'] == meta['og:image']
assert 'aggregateRating' not in data
assert 'sameAs' not in data  # Still awaiting the verified Google profile.
assert 'streetAddress' not in data['address']
assert 'openingHours' not in data and 'openingHoursSpecification' not in data
images = [a for t, a in p.nodes if t == 'img']
assert len(images) == 8
for i, attrs in enumerate(images):
    assert attrs['alt'] and attrs['width'] and attrs['height'] and attrs['sizes']
    with Image.open(root / attrs['src']) as image:
        assert image.size == (int(attrs['width']), int(attrs['height']))
    candidates = []
    for item in attrs['srcset'].split(', '):
        filename, descriptor = item.split()
        with Image.open(root / filename) as image:
            assert image.width == int(descriptor[:-1])
        candidates.append(int(descriptor[:-1]))
    assert candidates == sorted(set(candidates))
    assert attrs.get('loading') == ('lazy' if i else None)
assert '.nav-ready .navigation { display:none;' in css
assert '.navigation { display:flex; flex-direction:column;' in css
assert "root.classList.add('nav-ready')" in js
assert 'scroll-padding-bottom:calc(var(--mobile-contact-height) + 1.25rem)' in css
assert 'env(safe-area-inset-bottom)' in css
assert ':focus-visible' in css and 'overflow-x:hidden' not in css

def luminance(hex_color):
    rgb = [int(hex_color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    rgb = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    return sum(v*c for v, c in zip(rgb, [.2126, .7152, .0722]))

contrasts = []
for foreground, background in [('#f1f6f8','#0c171d'),('#a9bfca','#0c171d'),('#a9bfca','#13232d'),('#f5f9fb','#104c60'),('#d1e7ef','#104c60'),('#49626f','#eaf0f3'),('#889eaa','#0c171d'),('#e8bd67','#13232d')]:
    values = sorted([luminance(foreground), luminance(background)])
    ratio = (values[1]+.05)/(values[0]+.05)
    assert ratio >= 4.5, (foreground, background, ratio)
    contrasts.append({'foreground':foreground,'background':background,'ratio':round(ratio,2)})

def display_width(width, kind):
    if kind == 'hero':
        if width <= 380: return width-34
        if width <= 720: return width-42
        if width <= 950: return width/2.2-47.455
        if width <= 1150: return width/2.25-49.111
        if width <= 1352: return width/2.25-79.333
        return 513 if width >= 1500 else 522
    if width <= 380: size=width-82
    elif width <= 720: size=width-94
    elif width <= 950: size=width/2-85.5
    elif width <= 1150: size=width/3-73.333
    elif width <= 1352: size=width/3-98.667
    else: size=352
    return (size-3)/2 if kind == 'pair' else size

original = sum((root/a['src']).stat().st_size for a in images)
budgets = []
for width in [320,360,390,720,768]:
    for dpr in [1,2]:
        chosen=[]
        for attrs in images:
            kind='hero' if attrs['src']=='motherboard.webp' else ('pair' if attrs['src'] in ['servico-pc.webp','servico-notebook.webp'] else 'single')
            candidates=[(filename,int(descriptor[:-1])) for filename,descriptor in (item.split() for item in attrs['srcset'].split(', '))]
            needed=display_width(width,kind)*dpr
            filename=next((f for f,w in candidates if w>=needed),candidates[-1][0])
            chosen.append((root/filename).stat().st_size)
        total=sum(chosen)
        budgets.append({'viewport':width,'dpr':dpr,'all_images_kib':round(total/1024,1),'reduction_percent':round((1-total/original)*100,1),'hero_kib':round(chosen[0]/1024,1)})

report={'checks':'PASS: HTML, fragment links, WhatsApp/tel, FAQ structure, image dimensions/candidates/loading, metadata, JSON-LD, no private address or invented rating count; sampled text contrast.', 'original_all_images_kib':round(original/1024,1),'contrasts':contrasts,'image_budget_estimates':budgets,'limitations':'Asset-selection estimates only. No browser rendering, LCP, Lighthouse, actual network timing, text zoom or screenshot verification.'}
(root/'tests'/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
