import { readdirSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root = new URL('../.next/', import.meta.url);
const chunks = new URL('static/chunks/', root);
const css = readdirSync(chunks).filter(x => x.endsWith('.css')).map(x => readFileSync(new URL(x, chunks), 'utf8')).join('\n');
assert.ok(css.includes('.project-grid'));
function markup(path) {
  const html = readFileSync(new URL('server/app/' + path + '.html', root), 'utf8');
  return html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1]
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/href="\/#gallery"/g, 'href="#gallery"')
    .replace(/href="\/"/g, 'href="#"')
    .replace(/href="\/projects\/([^"]+)"/g, 'href="#project-$1"');
}
const home = markup('index');
assert.equal((home.match(/class="project-card"/g) ?? []).length, 3);
const slugs = ['typescript-playground', 'excalidraw', 'vega-editor'];
const details = slugs.map(slug => {
  const main = markup('projects/' + slug).match(/<main\b[\s\S]*?<\/main>/)[0];
  return '<section hidden id="project-' + slug + '">' + main + '</section>';
}).join('\n');
const script = `
const gallery = document.querySelector('#gallery');
const home = document.querySelector('body > main');
const projects = Array.from(gallery.querySelectorAll('.project-card'));
const filters = Array.from(gallery.querySelectorAll('.filters button'));
const search = gallery.querySelector('input');
const count = gallery.querySelector('[role=status]');
function updateGallery() {
  const category = filters.find(button => button.getAttribute('aria-pressed') === 'true').textContent;
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const project of projects) {
    const matchesCategory = category === 'All projects' || project.querySelector('.category').textContent === category;
    const text = Array.from(project.querySelectorAll('h3, .card-content > p:not(.category), .card-meta span:first-child'))
      .map(element => element.textContent).join(' ').toLowerCase();
    project.hidden = !matchesCategory || !text.includes(query);
    if (!project.hidden) visible++;
  }
  count.textContent = visible === 0 ? 'No projects match your search.' : visible + (visible === 1 ? ' project' : ' projects');
}
for (const button of filters) {
  button.addEventListener('click', () => {
    for (const option of filters) option.setAttribute('aria-pressed', String(button === option));
    updateGallery();
  });
}
search.addEventListener('input', updateGallery);
function navigate() {
  let current = null;
  for (const page of document.querySelectorAll('section[id^="project-"]')) {
    page.hidden = '#' + page.id !== location.hash;
    if (!page.hidden) current = page;
  }
  home.hidden = Boolean(current);
  if (current) window.scrollTo(0, 0);
  if (location.hash === '#gallery') gallery.scrollIntoView();
}
window.addEventListener('hashchange', navigate);
navigate();
`;
const createScript = `
const previewForm = document.getElementById('repository').form;
const previewStatus = document.createElement('p');
previewStatus.setAttribute('role', 'status');
previewStatus.className = 'mt-3';
previewForm.after(previewStatus);
previewForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = previewForm.querySelector('button');
  const repository = new FormData(previewForm).get('repository');
  button.disabled = true;
  previewStatus.textContent = 'Checking repository…';
  try {
    const response = await fetch('/api/temporary-previews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repository })
    });
    const result = await response.json();
    if (!response.ok) {
      previewStatus.textContent = result.error;
      return;
    }
    const link = document.createElement('a');
    link.className = 'button';
    link.textContent = 'Open temporary preview';
    link.href = result.path;
    previewStatus.replaceChildren(link);
  } catch {
    previewStatus.textContent = 'Could not create a preview. Try again.';
  } finally {
    button.disabled = false;
  }
});
`;
new Function(script + createScript);
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>RepoPlay</title><style>' + css + '\n[hidden]{display:none!important}</style></head><body>' + home + details + '<script>' + script + createScript + '</script></body></html>';
const sources = ['lib/temporary-preview.ts', 'lib/source-preview-runtime.js', 'app/api/temporary-previews/route.ts', 'app/temporary/[token]/route.ts'];
const shared = sources.map(path => {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/^export /gm, '');
  return ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
}).join('\n');

const worker = `
${shared}
const homeHtml = ${JSON.stringify(html)};
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/' && request.method === 'GET') {
      return new Response(homeHtml, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (pathname === '/api/temporary-previews' && request.method === 'POST') {
      return createTemporaryPreview(request, env.PREVIEW_SIGNING_SECRET);
    }
    if (pathname.startsWith('/temporary/') && request.method === 'GET') {
      return serveTemporaryPreview(request, pathname.slice('/temporary/'.length), env.PREVIEW_SIGNING_SECRET);
    }
    return new Response('Not found.', { status: 404 });
  },
};
`;
const output = new URL('../dist/server/', import.meta.url);
mkdirSync(output, { recursive: true });
writeFileSync(new URL('index.js', output), worker);
