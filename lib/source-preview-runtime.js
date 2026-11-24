export async function sourcePreviewRuntime() {
  const status = document.getElementById("build-status");
  const source = window.repoPlaySource;
  const trackerDemo = source.expenseTrackerDemo;
  const loaders = {
    ".tsx": "tsx", ".ts": "ts", ".jsx": "jsx", ".js": "js",
    ".css": "css", ".json": "json", ".svg": "dataurl", ".png": "dataurl",
    ".mp3": "dataurl", ".wav": "dataurl", ".ogg": "dataurl",
    ".ttf": "dataurl", ".otf": "dataurl", ".woff": "dataurl", ".woff2": "dataurl",
    ".jpg": "dataurl", ".jpeg": "dataurl", ".webp": "dataurl", ".gif": "dataurl",
  };
  const directory = source.directory ? source.directory + "/" : "";
  const base = `https://raw.githubusercontent.com/${source.owner}/${source.name}/${source.commit}/${directory}`;
  const mirror = `https://cdn.jsdelivr.net/gh/${source.owner}/${source.name}@${source.commit}/${directory}`;
  if (/^src\/index\./.test(source.entry)) loaders[".js"] = "jsx";
  const files = new Map();
  if (trackerDemo) {
    const storage = new Map([["token", "repoplay-demo"]]);
    window.repoPlayStorage = {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key),
      clear: () => storage.clear(),
    };
  }
  let totalBytes = 0;

  async function fetchFile(path, metadataLimit) {
    const get = (host) => fetch(host + path, { redirect: "error", signal: AbortSignal.timeout(6000) });
    let response = await get(base).catch(() => null);
    if (!response || (!response.ok && response.status !== 404)) {
      await response?.body?.cancel();
      response = await get(mirror).catch(() => null);
    }
    if (!response) throw new Error("Source download timed out: " + path);
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
        if (!metadataLimit) totalBytes += value.byteLength;
        if (bytes > (metadataLimit ?? (source.frontendOnly ? 2 * 1024 * 1024 : 262144)) || totalBytes > (source.frontendOnly ? 6 * 1024 * 1024 : 1048576)) throw new Error("Project exceeds the source preview size limit.");
        parts.push(value);
      }
    } finally {
      await reader.cancel();
    }
    return new Uint8Array(await new Blob(parts).arrayBuffer());
  }

  function readFile(path) {
    if (!files.has(path)) {
      if (files.size >= (source.frontendOnly ? 240 : 80)) throw new Error("Project exceeds the source preview file limit.");
      files.set(path, fetchFile(path));
    }
    return files.get(path);
  }


  async function readMetadata(path, limit) {
    try {
      const bytes = await fetchFile(path, limit);
      return bytes ? JSON.parse(new TextDecoder().decode(bytes)) : {};
    } catch {
      return {};
    }
  }

  const [manifest, lockfile] = await Promise.all([
    readMetadata("package.json", 64 * 1024),
    readMetadata("package-lock.json", 2 * 1024 * 1024),
  ]);
  const declared = { ...manifest?.devDependencies, ...manifest?.dependencies };
  const exactVersion = /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/;
  const supportedRange = /^[~^]?\d+(?:\.(?:\d+|x)){0,2}(?:-[\w.-]+)?$/;

  function packageVersion(name) {
    if (!Object.hasOwn(declared, name)) return null;
    const locked = lockfile?.packages?.["node_modules/" + name]?.version ?? lockfile?.dependencies?.[name]?.version;
    if (typeof locked === "string" && exactVersion.test(locked)) return locked;
    const range = declared[name];
    return typeof range === "string" && supportedRange.test(range) ? range : null;
  }

  const reactVersion = packageVersion("react") ?? "19.2.6";
  const [reactMajor, reactMinor] = reactVersion.replace(/^[~^]/, "").split(".").map(Number);
  const classicJsx = reactMajor < 16 || (reactMajor === 16 && reactMinor < 14);
  const domVersion = packageVersion("react-dom") ?? reactVersion;
  const routerVersion = packageVersion("react-router-dom") ?? "7.15.1";
  const dependencies = {
    react: `https://esm.sh/react@${reactVersion}`,
    "react/jsx-runtime": `https://esm.sh/react@${reactVersion}/jsx-runtime`,
    "react-dom": `https://esm.sh/react-dom@${domVersion}?deps=react@${reactVersion}`,
    "react-dom/client": `https://esm.sh/react-dom@${domVersion}/client?deps=react@${reactVersion}`,
  };
  const demoPackages = {
    axios: "1.17.0", "emoji-picker-react": "4.19.1", moment: "2.30.1",
    "react-hot-toast": "2.6.0", "react-icons": "5.6.0", recharts: "3.8.1",
    "@react-oauth/google": "0.13.5",
  };
  const router = `https://esm.sh/react-router-dom@${routerVersion}?deps=react@${reactVersion},react-dom@${domVersion}`;
  const plugin = {
    name: "pinned-github-source",
    setup(build) {
      build.onResolve({ filter: /^https:\/\/esm\.sh\//, namespace: "router" }, args => ({ path: args.path, external: true }));
      build.onResolve({ filter: /.*/ }, async args => {
        if (Object.hasOwn(dependencies, args.path)) return { path: dependencies[args.path], external: true };
        if (trackerDemo && args.path === "tailwindcss" && args.kind === "import-rule") return { path: args.path, external: true };
        if (args.kind === "url-token" && args.path.startsWith("https://")) return { path: args.path, external: true };
        if (args.kind === "import-rule" && args.path.startsWith("https://fonts.googleapis.com/")) return { path: args.path, external: true };
        if (trackerDemo && args.path === "@react-oauth/google") return { path: "oauth", namespace: "tracker-demo" };
        const packageName = args.path.startsWith("@") ? args.path.split("/").slice(0, 2).join("/") : args.path.split("/")[0];
        if (args.path === "react-router-dom") return { path: "router", namespace: "router" };
        const version = trackerDemo && Object.hasOwn(demoPackages, packageName) ? demoPackages[packageName] : packageVersion(packageName);
        if (version && /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(?:\/[a-z0-9][\w.-]*)*$/i.test(args.path) && ["import-statement", "dynamic-import", "require-call"].includes(args.kind)) {
          const subpath = args.path.slice(packageName.length);
          return { path: `https://esm.sh/${packageName}@${version}${subpath}?deps=react@${reactVersion},react-dom@${domVersion}`, external: true };
        }

        let path;
        if (args.kind === "entry-point") {
          path = args.path;
        } else if (args.path.startsWith("@/")) {
          path = new URL("src/" + args.path.slice(2), "https://source.invalid/").pathname.slice(1);
        } else if (args.path.startsWith(".") || args.path.startsWith("/")) {
          const directory = args.importer.slice(0, args.importer.lastIndexOf("/") + 1);
          const relative = args.path.startsWith("/") && !args.path.startsWith("/src/") ? "public" + args.path : args.path;
          path = new URL(relative, "https://source.invalid/" + directory).pathname.slice(1);
          if (relative.startsWith("public/")) path = relative;
        } else {
          return { errors: [{ text: "Unsupported import: " + args.path + ". Use a browser-compatible npm dependency declared in package.json" }] };
        }

        if (trackerDemo && /^src\/utils\/axiosInstance(?:\.js)?$/.test(path)) return { path: "api", namespace: "tracker-demo" };
        if (!/^(src|public)\/(?:(?:[\w.()-]|%20)+\/)*(?:[\w.()-]|%20)+$/.test(path) || path.split("/").some(part => part === "." || part === "..")) {
          return { errors: [{ text: "Imports must resolve within src or public." }] };
        }
        const extensions = [".tsx", ".jsx", ".ts", ".js"];
        const candidates = Object.hasOwn(loaders, path.slice(path.lastIndexOf(".")))
          ? [path]
          : [...[...extensions, ".json", ".css"].map(ext => path + ext), ...extensions.map(ext => path + "/index" + ext)];
        for (const candidate of candidates) {
          if (Object.hasOwn(loaders, candidate.slice(candidate.lastIndexOf("."))) && await readFile(candidate)) {
            return { path: candidate, namespace: "github" };
          }
        }
        return { errors: [{ text: "Source file not found: " + path }] };
      });
      build.onLoad({ filter: /.*/, namespace: "tracker-demo" }, args => ({
        loader: "js",
        contents: args.path === "oauth"
          ? "export const GoogleOAuthProvider = ({children}) => children; export const GoogleLogin = () => null;"
          : "(" + expenseTrackerApi.toString() + ")(); export default window.repoPlayDemoApi;",
      }));
      build.onLoad({ filter: /.*/, namespace: "github" }, async args => ({
        contents: await readFile(args.path),
        loader: loaders[args.path.slice(args.path.lastIndexOf("."))],
      }));
      build.onLoad({ filter: /.*/, namespace: "router" }, () => ({
        contents: `export * from "${router}"; import { MemoryRouter } from "${router}"; import { createElement } from "${dependencies.react}"; export const BrowserRouter = props => createElement(MemoryRouter, {initialEntries: [${JSON.stringify(trackerDemo ? "/dashboard" : "/")}], ...props});`,
        loader: "js",
      }));
    },
  };

  async function run() {
    if (!window.esbuild) throw new Error("The source compiler could not load.");
    await window.esbuild.initialize({ wasmURL: "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.25.12/esbuild.wasm" });
    const result = await window.esbuild.build({
      entryPoints: [source.entry], outfile: "app.js", bundle: true, write: false,
      platform: "browser", format: "esm", plugins: [plugin], logLevel: "silent",
      ...(classicJsx ? {
        jsx: "transform", jsxFactory: "__repoPlayReact.createElement", jsxFragment: "__repoPlayReact.Fragment",
        banner: { js: "import * as __repoPlayReact from " + JSON.stringify(dependencies.react) + ";" },
      } : { jsx: "automatic" }),
      define: trackerDemo ? { localStorage: "window.repoPlayStorage", "window.localStorage": "window.repoPlayStorage", "import.meta.env": "{}" } : undefined,
    });
    if (Date.now() >= source.expiresAt) throw new Error("This preview has expired.");
    for (const file of result.outputFiles) {
      if (!file.path.endsWith(".css")) continue;
      const style = document.createElement("style");
      if (trackerDemo) style.type = "text/tailwindcss";
      style.textContent = file.text.replace(/@import\s+[^;]*fonts\.googleapis\.com[^;]*;/g, "");
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
  function expenseTrackerApi() {
    const date = days => new Date(Date.now() - days * 86400000).toISOString();
    const income = [
      { _id: "sample-1", source: "Salary", amount: 4200, date: date(12), icon: "💼", type: "income" },
      { _id: "sample-2", source: "Freelance", amount: 650, date: date(3), icon: "💻", type: "income" },
    ];
    const expenses = [
      { _id: "sample-3", category: "Housing", amount: 1200, date: date(10), icon: "🏠", type: "expense" },
      { _id: "sample-4", category: "Groceries", amount: 160, date: date(5), icon: "🛒", type: "expense" },
      { _id: "sample-5", category: "Transport", amount: 90, date: date(2), icon: "🚌", type: "expense" },
    ];
    const total = rows => rows.reduce((sum, row) => sum + Number(row.amount), 0);
    const disabled = () => { throw new Error("This action requires the live app."); };
    window.repoPlayDemoApi = {
      async get(path) {
        if (path === "/api/v1/auth/getUser") return { data: { fullName: "Demo User", email: "demo@example.com" } };
        if (path === "/api/v1/income/getUser") return { data: [...income] };
        if (path === "/api/v1/expense/getUser") return { data: [...expenses] };
        if (path === "/api/v1/dashboard") return { data: {
          totalIncome: total(income), totalExpense: total(expenses), totalBalance: total(income) - total(expenses),
          recentTransactions: [...income, ...expenses].sort((first, second) => second.date.localeCompare(first.date)),
          last30daysIncomes: { transactions: income }, last30daysExpenses: { transactions: expenses },
        } };
        if (path === "/api/ai/insights") return { data: {
          summary: "Illustrative insights based on sample transactions.", riskScore: 3, topCategory: "Housing",
          spendingTrend: "Housing accounts for the largest share of spending.", budgetSuggestion: "Set a weekly grocery budget.",
          savingsOpportunity: "Review recurring expenses.", prediction: "Build a small buffer for next month.",
          recommendations: ["Track recurring costs"], warnings: [],
        } };
        return disabled();
      },
      async post(path, transaction) {
        const rows = path === "/api/v1/income/add" ? income : path === "/api/v1/expense/add" ? expenses : null;
        if (!rows) return disabled();
        rows.unshift({ ...transaction, _id: crypto.randomUUID(), type: rows === income ? "income" : "expense" });
        return { data: rows[0] };
      },
      async delete(path) {
        const match = /^\/api\/v1\/(income|expense)\/([\w-]+)$/.exec(path);
        if (!match) return disabled();
        const rows = match[1] === "income" ? income : expenses;
        const index = rows.findIndex(row => row._id === match[2]);
        if (index >= 0) rows.splice(index, 1);
        return { data: null };
      },
    };
  }
  run().catch(error => { status.textContent = error.errors?.[0]?.text ?? error.message; });
}
