(() => {
  const theme = document.getElementById("theme-toggle");
  const preferred = matchMedia("(prefers-color-scheme: dark)");
  const stored = () => { try { return localStorage.getItem("repoplay-theme"); } catch { return null; } };
  function applyTheme(value) {
    document.documentElement.dataset.theme = value;
    if (theme) theme.textContent = value === "dark" ? "Light mode" : "Dark mode";
  }
  applyTheme(stored() ?? (preferred.matches ? "dark" : "light"));
  theme?.addEventListener("click", () => {
    const value = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("repoplay-theme", value); } catch {}
    applyTheme(value);
  });
  preferred.addEventListener("change", () => {
    if (!stored()) applyTheme(preferred.matches ? "dark" : "light");
  });

  const form = document.getElementById("preview-form");
  if (!form) return;
  const input = form.elements.repository;
  const button = form.querySelector("button");
  const result = document.getElementById("preview-result");
  const avatar = document.getElementById("account-avatar");
  const signin = document.getElementById("account-signin");
  const list = document.getElementById("history-list");
  const empty = document.getElementById("gallery-empty");
  const search = document.querySelector(".gallery-search input");
  let projects = [];
  let account = null;

  function renderGallery() {
    const query = search.value.trim().toLowerCase();
    list.replaceChildren();
    for (const project of projects) {
      const parts = new URL(project.repository).pathname.slice(1).split("/");
      if (!parts.join("/").toLowerCase().includes(query)) continue;
      const row = document.createElement("li");
      const text = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = parts[1];
      const subtitle = document.createElement("p");
      subtitle.textContent = parts[0] + " · " + new Date(project.renderedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      const open = document.createElement("button");
      open.type = "button";
      open.className = "quiet-button";
      open.textContent = "Preview again";
      open.addEventListener("click", () => {
        input.value = project.repository;
        input.focus();
        form.requestSubmit();
      });
      text.append(title, subtitle);
      row.append(text, open);
      list.append(row);
    }
    empty.hidden = list.childElementCount > 0;
    if (!account) {
      const link = document.createElement("a");
      link.href = "/signin";
      link.textContent = "Sign in";
      empty.replaceChildren(link, " to see your project gallery.");
    } else {
      empty.textContent = query ? "No projects match your search." : "Your gallery is empty. Open a preview to add your first project.";
    }
  }

  async function loadAccount() {
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      account = data.account;
      projects = data.projects;
      signin.hidden = Boolean(account);
      avatar.hidden = !account;
      if (account) {
        avatar.setAttribute("aria-label", account.name + " · account menu");
        const badge = avatar.querySelector("summary span");
        badge.textContent = account.name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase() || "U";
        if (account.avatar && !badge.querySelector("img")) {
          const image = document.createElement("img");
          image.alt = "";
          image.referrerPolicy = "no-referrer";
          image.addEventListener("error", () => image.remove());
          image.src = account.avatar;
          badge.append(image);
        }
        avatar.querySelector("strong").textContent = account.name;
      }
      search.parentElement.hidden = !projects.length;
      renderGallery();
    } catch {
      projects = [];
      account = null;
      list.replaceChildren();
      signin.hidden = false;
      avatar.hidden = true;
      search.parentElement.hidden = true;
      empty.hidden = false;
      empty.textContent = "Your gallery is temporarily unavailable.";
    }
  }
  search.addEventListener("input", renderGallery);
  window.addEventListener("pageshow", event => { if (event.persisted) loadAccount(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) loadAccount(); });
  loadAccount();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    button.disabled = true;
    result.hidden = false;
    result.textContent = "Checking repository…";
    try {
      const response = await fetch("/api/temporary-previews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repository: input.value }),
      });
      if (response.status === 401) {
        window.location.assign("/signin");
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        result.textContent = data.error ?? "Could not create a preview.";
        return;
      }
      const link = document.createElement("a");
      link.className = "button secondary";
      link.href = data.path;
      link.textContent = "Open preview";
      result.replaceChildren(link);
    } catch {
      result.textContent = "Could not create a preview. Try again.";
    } finally {
      button.disabled = false;
    }
  });
})();
