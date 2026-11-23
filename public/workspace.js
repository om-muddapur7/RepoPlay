(() => {
  const theme = document.getElementById("theme-toggle");
  const preferred = matchMedia("(prefers-color-scheme: dark)");
  const stored = () => { try { return localStorage.getItem("repoplay-theme"); } catch { return null; } };
  function applyTheme(value) {
    document.documentElement.dataset.theme = value;
    if (theme) {
      const label = value === "dark" ? "Switch to light mode" : "Switch to dark mode";
      theme.setAttribute("aria-label", label);
      theme.title = label;
      theme.querySelector("span").textContent = value === "dark" ? "☀︎" : "☾";
    }
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
  if (location.pathname === "/" && ["#gallery", "#preview"].includes(location.hash)) {
    location.replace("/workspace" + location.hash);
    return;
  }
  const input = form?.elements.repository;
  const button = form?.querySelector("button");
  const result = document.getElementById("preview-result");
  const avatar = document.getElementById("account-avatar");
  const signin = document.getElementById("account-signin");
  if (!avatar || !signin) return;
  const landingSignin = document.getElementById("landing-signin");
  const list = document.getElementById("history-list");
  const empty = document.getElementById("gallery-empty");
  const search = document.querySelector(".gallery-search input");
  let projects = [];
  let account = null;

  function renderGallery() {
    if (!form) return;
    const query = search.value.trim().toLowerCase();
    list.replaceChildren();
    for (const project of projects) {
      const parts = new URL(project.repository).pathname.slice(1).split("/");
      if (!parts.join("/").toLowerCase().includes(query)) continue;
      const row = document.createElement("li");
      const media = document.createElement("div");
      media.className = "gallery-image";
      const mark = document.createElement("span");
      mark.className = "gallery-image-mark";
      mark.textContent = parts[1].slice(0, 2).toUpperCase();
      media.append(mark);
      media.setAttribute("aria-hidden", "true");
      const image = document.createElement("img");
      image.alt = "";
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      const petProject = /(?:^|[-_])(?:pet|dog|puppy)(?:[-_]|$)/i.test(parts[1]);
      image.addEventListener("error", () => {
        if (petProject && !image.dataset.fallback) {
          image.dataset.fallback = "true";
          image.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop";
        } else {
          image.remove();
        }
      });
      image.src = "https://opengraph.githubassets.com/1/" + parts.map(encodeURIComponent).join("/");
      media.append(image);
      const text = document.createElement("div");
      text.className = "gallery-card-body";
      const title = document.createElement("h3");
      title.textContent = parts[1];
      const subtitle = document.createElement("p");
      subtitle.className = "gallery-card-meta";
      subtitle.textContent = parts[0] + " · " + new Date(project.renderedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      const description = document.createElement("p");
      description.textContent = project.description || "Open a fresh preview of this GitHub project.";
      const actions = document.createElement("div");
      actions.className = "gallery-card-actions";
      const open = document.createElement("button");
      open.type = "button";
      open.className = "quiet-button";
      open.textContent = "Preview again";
      open.addEventListener("click", () => {
        input.value = project.repository;
        form.elements.frontendOnly.checked = project.mode === "frontend";
        input.focus();
        form.requestSubmit();
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "quiet-button delete-project";
      remove.textContent = "Delete";
      remove.setAttribute("aria-label", "Delete " + parts[1] + " from your gallery");
      remove.addEventListener("click", async () => {
        if (!window.confirm("Remove " + parts[1] + " from your gallery?")) return;
        remove.disabled = true;
        try {
          const write = () => fetch("/api/account", {
            method: "DELETE", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repository: project.repository }),
          });
          const response = await (navigator.locks ? navigator.locks.request("repoplay-gallery", write) : write());
          if (!response.ok) throw new Error();
          await loadAccount();
        } catch {
          const notice = document.getElementById("gallery-notice");
          notice.textContent = "Could not delete the project. Try again.";
          remove.disabled = false;
        }
      });
      actions.append(open, remove);
      text.append(title, subtitle, description, actions);
      row.append(media, text);
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
      if (landingSignin) landingSignin.hidden = Boolean(account);
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
      if (search) search.parentElement.hidden = !projects.length;
      renderGallery();
    } catch {
      projects = [];
      account = null;
      if (list) list.replaceChildren();
      signin.hidden = false;
      if (landingSignin) landingSignin.hidden = false;
      avatar.hidden = true;
      if (search) search.parentElement.hidden = true;
      if (empty) {
        empty.hidden = false;
        empty.textContent = "Your gallery is temporarily unavailable.";
      }
    }
  }
  search?.addEventListener("input", renderGallery);
  window.addEventListener("pageshow", event => { if (event.persisted) loadAccount(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) loadAccount(); });
  loadAccount();

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    button.disabled = true;
    result.hidden = false;
    result.textContent = "Checking repository…";
    try {
      const response = await fetch("/api/temporary-previews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repository: input.value, mode: form.elements.frontendOnly.checked ? "frontend" : undefined }),
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
