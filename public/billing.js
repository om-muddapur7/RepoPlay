(async () => {
  const table = document.getElementById("clerk-pricing-table");
  const profile = document.getElementById("clerk-billing-profile");
  const status = document.getElementById("billing-status");
  const signIn = document.getElementById("billing-signin");
  if (!status) return;

  function loadScript(src, publishableKey) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      if (publishableKey) script.dataset.clerkPublishableKey = publishableKey;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }

  try {
    const response = await fetch("/api/billing-config");
    if (!response.ok) throw new Error("Billing configuration unavailable");
    const { publishableKey } = await response.json();
    if (!publishableKey) {
      status.textContent = "Online subscriptions are coming soon.";
      return;
    }
    const keyParts = /^pk_(live|test)_([\w+/=-]+)$/.exec(publishableKey);
    if (!keyParts) throw new Error("Invalid billing configuration");
    const decoded = atob(keyParts[2].replaceAll("-", "+").replaceAll("_", "/"));
    if (!/^(?:[a-z\d-]+\.)+[a-z\d-]+\$$/i.test(decoded)) throw new Error("Invalid billing domain");
    const domain = decoded.slice(0, -1);
    await Promise.all([
      loadScript("https://" + domain + "/npm/@clerk/ui@1/dist/ui.browser.js"),
      loadScript("https://" + domain + "/npm/@clerk/clerk-js@6/dist/clerk.browser.js", publishableKey),
    ]);
    const clerk = window.Clerk;
    await clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
    signIn.addEventListener("click", () => clerk.openSignIn());
    if (table) {
      clerk.mountPricingTable(table, { for: "user" });
      document.getElementById("plan-fallback")?.setAttribute("hidden", "");
    }
    let mounted = false;
    function syncProfile({ user }) {
      if (!profile) return;
      if (Boolean(user) !== mounted) {
        if (user) clerk.mountUserProfile(profile);
        else clerk.unmountUserProfile(profile);
        mounted = Boolean(user);
      }
      signIn.hidden = Boolean(user);
      status.textContent = user ? "" : "Sign in to your Clerk billing account to view and manage your subscription.";
    }
    status.textContent = "";
    syncProfile({ user: clerk.user });
    clerk.addListener(syncProfile);
  } catch {
    status.textContent = "Billing is temporarily unavailable. Try again later.";
  }
})();
