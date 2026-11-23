export function sourcePreviewRuntime() {
  const status = document.getElementById("build-status");
  const source = window.repoPlaySource;
  const reactVersion = "19.2.6";
  const routerVersion = "7.15.1";
  const dependencies = {
    react: `https://esm.sh/react@${reactVersion}`,
    "react/jsx-runtime": `https://esm.sh/react@${reactVersion}/jsx-runtime`,
    "react-dom": `https://esm.sh/react-dom@${reactVersion}?deps=react@${reactVersion}`,
    "react-dom/client": `https://esm.sh/react-dom@${reactVersion}/client?deps=react@${reactVersion}`,
  };
  const router = `https://esm.sh/react-router-dom@${routerVersion}?deps=react@${reactVersion},react-dom@${reactVersion}`;
  const loaders = {
    ".tsx": "tsx", ".ts": "ts", ".jsx": "jsx", ".js": "js",
    ".css": "css", ".json": "json", ".svg": "dataurl", ".png": "dataurl",
    ".jpg": "dataurl", ".jpeg": "dataurl", ".webp": "dataurl",
  };
  const base = `https://raw.githubusercontent.com/${source.owner}/${source.name}/${source.commit}/`;
  const files = new Map();
  let totalBytes = 0;

  async function fetchFile(path) {
    const response = await fetch(base + path, { redirect: "error", signal: AbortSignal.timeout(8000) });
    if (response.status === 404) return null;
    if (!response.ok || !response.body) throw new Error("GitHub could not provide a source file.");
    const reader = response.body.getReader();
    const parts = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        totalBytes += value.byteLength;
        if (bytes > 262144 || totalBytes > 1048576) throw new Error("Project exceeds the source preview size limit.");
        parts.push(value);
      }
    } finally {
      await reader.cancel();
    }
    return new Uint8Array(await new Blob(parts).arrayBuffer());
  }

  function readFile(path) {
    if (!files.has(path)) {
      if (files.size >= 80) throw new Error("Project exceeds the source preview file limit.");
      files.set(path, fetchFile(path));
    }
    return files.get(path);
  }

  const plugin = {
    name: "pinned-github-source",
    setup(build) {
      build.onResolve({ filter: /^https:\/\/esm\.sh\//, namespace: "router" }, args => ({ path: args.path, external: true }));
      build.onResolve({ filter: /.*/ }, async args => {
        if (Object.hasOwn(dependencies, args.path)) return { path: dependencies[args.path], external: true };
        if (args.path === "react-router-dom") return { path: "router", namespace: "router" };

        let path;
        if (args.kind === "entry-point") {
          path = args.path;
        } else if (args.path.startsWith(".") || args.path.startsWith("/")) {
          const directory = args.importer.slice(0, args.importer.lastIndexOf("/") + 1);
          const relative = args.path.startsWith("/") && !args.path.startsWith("/src/") ? "public" + args.path : args.path;
          path = new URL(relative, "https://source.invalid/" + directory).pathname.slice(1);
          if (relative.startsWith("public/")) path = relative;
        } else {
          return { errors: [{ text: "Unsupported import: " + args.path }] };
        }

        if (!/^(src|public)\/(?:[\w.-]+\/)*[\w.-]+$/.test(path) || path.split("/").some(part => part === "." || part === "..")) {
          return { errors: [{ text: "Imports must resolve within src or public." }] };
        }
        const extensions = Object.keys(loaders);
        const candidates = /\.[a-z\d]+$/i.test(path)
          ? [path]
          : [...extensions.map(ext => path + ext), ...extensions.slice(0, 4).map(ext => path + "/index" + ext)];
        for (const candidate of candidates) {
          if (Object.hasOwn(loaders, candidate.slice(candidate.lastIndexOf("."))) && await readFile(candidate)) {
            return { path: candidate, namespace: "github" };
          }
        }
        return { errors: [{ text: "Source file not found: " + path }] };
      });
      build.onLoad({ filter: /.*/, namespace: "github" }, async args => ({
        contents: await readFile(args.path),
        loader: loaders[args.path.slice(args.path.lastIndexOf("."))],
      }));
      build.onLoad({ filter: /.*/, namespace: "router" }, () => ({
        contents: `export * from "${router}"; export { MemoryRouter as BrowserRouter } from "${router}";`,
        loader: "js",
      }));
    },
  };

  async function run() {
    if (!window.esbuild) throw new Error("The source compiler could not load.");
    await window.esbuild.initialize({ wasmURL: "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.25.12/esbuild.wasm" });
    const result = await window.esbuild.build({
      entryPoints: [source.entry], outfile: "app.js", bundle: true, write: false,
      platform: "browser", format: "esm", jsx: "automatic", plugins: [plugin], logLevel: "silent",
    });
    if (Date.now() >= source.expiresAt) throw new Error("This preview has expired.");
    for (const file of result.outputFiles) {
      if (!file.path.endsWith(".css")) continue;
      const style = document.createElement("style");
      style.textContent = file.text;
      document.head.append(style);
    }
    const javascript = result.outputFiles.find(file => file.path.endsWith(".js"));
    if (!javascript) throw new Error("The compiler produced no JavaScript.");
    const url = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(new Blob([javascript.contents], { type: "text/javascript" }));
    });
    const script = document.createElement("script");
    script.type = "module";
    script.src = url;
    script.onload = () => {
      const root = document.getElementById("root");
      const observer = new MutationObserver(ready);
      function ready() {
        if (!root.firstElementChild && !root.textContent.trim()) return;
        observer.disconnect();
        status.hidden = true;
        window.parent.postMessage("repoplay:rendered", "*");
      }
      observer.observe(root, { childList: true, subtree: true, characterData: true });
      ready();
      setTimeout(() => {
        observer.disconnect();
        if (!status.hidden) status.textContent = "The app did not render content.";
      }, 15000);
    };
    script.onerror = () => { status.textContent = "The compiled project could not start."; };
    document.body.append(script);
  }
  run().catch(error => { status.textContent = error.errors?.[0]?.text ?? error.message; });
}
