// DOM simulation of navigation/focus behavior; this is not a rendered browser test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

function setup({ width = 390, height = 72, missingMenu = false, missingYear = false, legacy = false } = {}) {
  const classes = new Set();
  const classList = { add: (x) => classes.add(x), toggle: (x, on) => on ? classes.add(x) : classes.delete(x), contains: (x) => classes.has(x) };
  const attributes = { 'aria-expanded': 'false' };
  const styles = {};
  const events = new Map();
  const document = { activeElement: null, body: {}, addEventListener: (name, f) => events.set(name, f) };
  const makeTarget = (name) => ({ name, focused: false, attrs: {}, hasAttribute(key) { return key in this.attrs; }, setAttribute(key, value) { this.attrs[key] = value; }, focus() { document.activeElement = this; this.focused = true; }, getBoundingClientRect: () => ({ top: 500, bottom: 540, height: 40 }), scrollIntoView() { this.scrolled = true; } });
  const button = makeTarget('button');
  button.getAttribute = (x) => attributes[x]; button.setAttribute = (x, v) => attributes[x] = v;
  button.contains = (x) => x === button; button.addEventListener = (name, f) => events.set('button:' + name, f);
  const destination = makeTarget('servicos');
  const link = makeTarget('link');
  Object.assign(link, { hash: '#servicos', origin: 'https://lcschristen.github.io', pathname: '/tt/' });
  link.closest = () => link;
  const nav = { classList, contains: (x) => x === link, addEventListener: (name, f) => events.set('nav:' + name, f) };
  const bar = { contains: () => false, getBoundingClientRect: () => ({ height }) };
  const year = {};
  const media = { matches: width <= 950, addListener: (f) => events.set('media', f) };
  if (!legacy) media.addEventListener = (name, f) => events.set('media', f);
  document.documentElement = { classList, style: { setProperty: (name, value) => styles[name] = value } };
  document.querySelector = (selector) => selector === '.menu-toggle' ? (missingMenu ? null : button) : bar;
  document.getElementById = (id) => ({ navegacao: missingMenu ? null : nav, servicos: destination, ano: missingYear ? null : year })[id] || null;
  const window = { location: { origin: link.origin, pathname: link.pathname }, innerHeight: 600, matchMedia: () => media, addEventListener: (name, f) => events.set('window:' + name, f), requestAnimationFrame: (f) => f() };
  let resized;
  window.ResizeObserver = function (f) { resized = f; this.observe = () => {}; };
  document.activeElement = document.body;
  vm.runInNewContext(source, { document, window, ResizeObserver: window.ResizeObserver, Date, console });
  return { events, classes, attributes, styles, button, link, document, destination, media, year, resize: () => resized() };
}

for (const width of [320, 360, 390, 720, 768]) {
  const s = setup({ width });
  assert(s.classes.has('nav-ready'));
  s.events.get('button:click')();
  assert.equal(s.attributes['aria-expanded'], 'true');
  assert(s.classes.has('is-open'));
  s.link.focus();
  s.events.get('nav:click')({ target: s.link, detail: 0 });
  assert.equal(s.attributes['aria-expanded'], 'false');
  assert.equal(s.document.activeElement, s.destination);
  assert.equal(s.destination.attrs.tabindex, '-1');
  s.events.get('button:click')();
  let prevented = false;
  s.events.get('keydown')({ key: 'Escape', preventDefault() { prevented = true; } });
  assert(prevented);
  assert.equal(s.document.activeElement, s.button);
  s.events.get('button:click')(); s.link.focus();
  s.events.get('click')({ target: {} });
  assert.equal(s.attributes['aria-expanded'], 'false');
  assert.equal(s.document.activeElement, s.button);
}

const external = setup();
external.events.get('button:click')(); external.link.focus(); external.link.hash = '';
external.events.get('nav:click')({ target: external.link });
assert.equal(external.document.activeElement, external.button);
const wide = setup({ width: 1100 });
wide.events.get('nav:click')({ target: wide.link });
assert.equal(wide.destination.focused, false);
wide.link.focus(); wide.media.matches = true; wide.events.get('media')();
assert.equal(wide.document.activeElement, wide.button);
for (const height of [68, 108, 156]) {
  const s = setup({ height });
  assert.equal(s.styles['--mobile-contact-height'], height + 'px');
  s.link.getBoundingClientRect = () => ({ bottom: 590, height: 30 });
  s.link.focus(); s.events.get('focusin')();
  assert(s.link.scrolled);
  s.resize();
}
assert(!setup({ missingMenu: true }).classes.has('nav-ready'));
setup({ missingYear: true, legacy: true });
console.log('PASS: 5 widths, keyboard destination focus, Escape, outside click, external links, breakpoint, bar heights, missing elements and legacy media listener. DOM simulation only.');
