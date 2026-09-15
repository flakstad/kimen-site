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

  capture("site_page_viewed");

  for (const link of document.querySelectorAll("[data-event]")) {
    link.addEventListener("click", () => {
      let destinationPath = "";
      try {
        destinationPath = new URL(link.href, window.location.href).pathname;
      } catch (_error) {
        destinationPath = "";
      }
      capture(link.dataset.event, {destination_path: destinationPath});
    });
  }

  const form = document.querySelector("[data-private-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector("button[type='submit']");
  const endpoint = safeHttpsUrl(config.formEndpoint);
  let started = false;

  form.addEventListener("input", () => {
    if (started) return;
    started = true;
    capture("operations_form_started");
  });

  function setStatus(message, successful = false) {
    status.textContent = message;
    status.classList.toggle("success", successful);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    if (data.get("website")) {
      form.reset();
      setStatus("Thank you. Your response has been received.", true);
      return;
    }

    const callers = data.getAll("callers");
    if (callers.length === 0) {
      setStatus("Choose at least one caller which needs the operation.");
      return;
    }

    if (!endpoint) {
      setStatus("The private response form is not connected yet. Please try again later.");
      return;
    }

    data.append("source_path", window.location.pathname);
    data.append("utm_source", source.utm_source);
    data.append("utm_medium", source.utm_medium);
    data.append("utm_campaign", source.utm_campaign);
    data.append("referrer", source.referrer);

    submit.disabled = true;
    setStatus("Sending your response...");
    capture("operations_form_attempted", {
      current_access: String(data.get("current_access") || ""),
      callers: callers.join(","),
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        headers: {"Accept": "application/json"},
        body: data,
      });
      if (!response.ok) throw new Error(`Form submission failed with ${response.status}`);
      form.reset();
      setStatus("Thank you. We will follow up about the operation.", true);
      capture("operations_form_submitted", {
        current_access: String(data.get("current_access") || ""),
        callers: callers.join(","),
      });
    } catch (_error) {
      setStatus("We could not send the response. Please try again.");
      capture("operations_form_failed");
    } finally {
      submit.disabled = false;
    }
  });
})();
