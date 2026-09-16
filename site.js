(() => {
  "use strict";

  const config = window.KIMEN_SITE_CONFIG || {};
  const page = document.body.dataset.page || "unknown";
  const privacyPreference = navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";

  function safeHttpsUrl(value) {
    if (typeof value !== "string" || value.trim() === "") return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url : null;
    } catch (_error) {
      return null;
    }
  }

  function sessionId() {
    const key = "kimen_site_session";
    try {
      const existing = window.sessionStorage.getItem(key);
      if (existing) return existing;
      let created;
      if (typeof window.crypto.randomUUID === "function") {
        created = window.crypto.randomUUID();
      } else {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        created = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      }
      window.sessionStorage.setItem(key, created);
      return created;
    } catch (_error) {
      return `ephemeral-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  }

  function attribution() {
    const query = new URLSearchParams(window.location.search);
    const safeValue = (value) => String(value || "").slice(0, 120);
    let referrer = "";
    try {
      referrer = document.referrer ? new URL(document.referrer).origin : "";
    } catch (_error) {
      referrer = "";
    }
    return {
      utm_source: safeValue(query.get("utm_source")),
      utm_medium: safeValue(query.get("utm_medium")),
      utm_campaign: safeValue(query.get("utm_campaign")),
      referrer,
    };
  }

  const posthogHost = safeHttpsUrl(config.posthogHost);
  const posthogKey = typeof config.posthogKey === "string" ? config.posthogKey.trim() : "";
  const analyticsEnabled = Boolean(posthogHost && posthogKey && !privacyPreference);
  const source = attribution();

  function capture(event, properties = {}) {
    if (!analyticsEnabled) return;
    if (typeof event !== "string" || !event.startsWith("kimen_")) return;
    const payload = {
      api_key: posthogKey,
      event,
      properties: {
        distinct_id: sessionId(),
        $process_person_profile: false,
        $geoip_disable: true,
        $ip: null,
        product: "kimen",
        page,
        path: window.location.pathname,
        ...source,
        ...properties,
      },
    };

    void fetch(new URL("/capture/", posthogHost), {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      keepalive: true,
      referrerPolicy: "no-referrer",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  capture("kimen_site_page_viewed");

  for (const link of document.querySelectorAll("[data-event]")) {
    link.addEventListener("click", () => {
      let destinationPath = "";
      try {
        const destination = new URL(link.href, window.location.href);
        destinationPath = destination.protocol === "http:" || destination.protocol === "https:"
          ? destination.pathname
          : destination.protocol.replace(":", "");
      } catch (_error) {
        destinationPath = "";
      }
      capture(link.dataset.event, {
        destination_path: destinationPath,
        cta_location: String(link.dataset.location || ""),
      });
    });
  }
})();
