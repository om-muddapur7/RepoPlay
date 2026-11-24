import { readdirSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const root = new URL('../.next/', import.meta.url);
const assets = new URL('static/', root);
const css = readdirSync(assets, { recursive: true }).filter(path => path.endsWith('.css'))
  .map(path => readFileSync(new URL(path.replaceAll('\\', '/'), assets), 'utf8')).join('\n');
assert.ok(css.includes('.history-list'));
function markup(path) {
  const html = readFileSync(new URL('server/app/' + path + '.html', root), 'utf8');
  return html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1]
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*>/gi, '');
}
const home = markup('index');
const workspace = markup('workspace');
assert.ok(home.includes('id="home-title"'));
assert.ok(workspace.includes('id="history-list"'));
const workspaceScript = readFileSync(new URL('../public/workspace.js', import.meta.url), 'utf8');
function renderDocument(content) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>RepoPlay</title><style>' + css + '</style><script defer src="/workspace.js"></script></head><body>' + content + '</body></html>';
}
const sources = ['lib/temporary-preview.ts', 'lib/static-preview.ts', 'lib/source-preview-runtime.js', 'lib/repoplay-auth.ts', 'lib/gallery-history.ts', 'app/api/account/route.ts', 'app/api/temporary-previews/route.ts', 'app/temporary/[token]/route.ts'];
const shared = sources.map((path, index) => {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8')
    .replace(/^import .* from ["']\.{1,2}\/.*;\r?\n/gm, '')
    .replace(/^export (async )?function (GET|POST|DELETE)\(/gm, (_, asyncKeyword, method) => `${asyncKeyword ?? ""}function route${index}${method}(`)
    .replace(/^export /gm, '');
  return ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
}).join('\n');

const worker = `
${shared}
const homeHtml = ${JSON.stringify(renderDocument(home))};
const extraPages = ${JSON.stringify(Object.fromEntries(["about","plans","profile"].map(page => ["/"+page,renderDocument(markup(page))])))};
const workspaceHtml = ${JSON.stringify(renderDocument(workspace))};
const workspaceJs = ${JSON.stringify(workspaceScript)};
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (request.method === 'GET' && Object.hasOwn(extraPages, pathname)) return new Response(extraPages[pathname], { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    if ((pathname === '/' || pathname === '/workspace') && request.method === 'GET') {
      return new Response(pathname === '/' ? homeHtml : workspaceHtml, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (pathname === '/workspace.js' && request.method === 'GET') {
      return new Response(workspaceJs, { headers: { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' } });
    }
    if (pathname === '/api/account' && request.method === 'GET') {
      return accountDetails(request, env);
    }
    if (pathname === '/api/account' && request.method === 'DELETE') {
      return removeGalleryProject(request, env);
    }
    if (pathname.startsWith('/temporary/') && request.method === 'POST') {
      return recordRenderedPreview(request, pathname.slice('/temporary/'.length), env);
    }
    if (pathname === '/api/temporary-previews' && request.method === 'POST') {
      return authenticatedCreation(request, env);
    }
    if (pathname.startsWith('/temporary/') && request.method === 'GET') {
      return authenticatedViewer(request, pathname.slice('/temporary/'.length), env);
    }
    if (pathname.startsWith('/static-preview/') && request.method === 'GET') {
      const [, , token, ...segments] = pathname.split('/');
      return serveStaticAsset(request, token, segments, env.PREVIEW_SIGNING_SECRET, appOrigin(env) ?? undefined);
    }
    if (pathname === '/signin' && request.method === 'GET') {
      return signInPage(request, env);
    }
    if (pathname.startsWith('/auth/')) {
      return handleAuth(request, pathname.slice('/auth/'.length), env);
    }
    return new Response('Not found.', { status: 404 });
  },
};
`;
const output = new URL('../dist/server/', import.meta.url);
mkdirSync(output, { recursive: true });
const bundle = await build({
  stdin: { contents: worker, resolveDir: fileURLToPath(new URL('../', import.meta.url)) },
  bundle: true, platform: 'browser', format: 'esm', target: 'es2022', write: false,
});
writeFileSync(new URL('index.js', output), bundle.outputFiles[0].contents);
