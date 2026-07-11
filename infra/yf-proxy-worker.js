// Cloudflare Worker: relays outbound Yahoo Finance requests so they leave
// from Cloudflare's edge (with a real Yahoo session) instead of Render's
// shared, currently-blocked IP pool.
//
// Unlike a dumb byte relay, this worker manages its own Yahoo cookie
// internally. That matters for two reasons, both found by testing:
//   1. A cookie Yahoo sets for ".yahoo.com" can never be stored or resent by
//      a client that thinks it's talking to *.workers.dev — cookie domain
//      matching is enforced by every HTTP client. Handling the cookie here,
//      server-side, sidesteps that entirely: the Python backend never sees
//      or needs a Yahoo cookie.
//   2. Yahoo's edge returns a generic "Edge: Too Many Requests" 429 for
//      requests that don't look like a browser (e.g. missing/blank
//      User-Agent) -- independent of IP reputation. Always stamping a real
//      Chrome UA avoids tripping that.
//
// Deploy: Cloudflare dashboard -> Workers & Pages -> Create -> Start with
// Hello World! -> replace the code with this file -> Deploy. Copy the
// resulting *.workers.dev URL into Render's YF_PROXY_WORKER_URL env var.
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// Module-scope state persists across requests on a warm isolate; refetched
// lazily whenever missing (cold start) or rejected (expired/invalid).
let cachedCookie = null;

async function getCookie() {
  if (cachedCookie) return cachedCookie;
  const res = await fetch("https://fc.yahoo.com", {
    headers: { "User-Agent": BROWSER_UA },
    redirect: "follow",
  });
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error("Yahoo did not return a cookie from fc.yahoo.com");
  cachedCookie = setCookie.split(";")[0];
  return cachedCookie;
}

async function relay(targetUrl, method, cookie) {
  return fetch(targetUrl, {
    method,
    headers: { "User-Agent": BROWSER_UA, Cookie: cookie },
    redirect: "follow",
  });
}

// Exact allowlist, not a suffix check -- "endsWith('yahoo.com')" would also
// match an attacker-registered host like "evil-yahoo.com" and relay our
// cached cookie there. Only these hosts are ones yfinance actually calls.
const ALLOWED_HOSTS = new Set([
  "query1.finance.yahoo.com",
  "query2.finance.yahoo.com",
  "fc.yahoo.com",
  "guce.yahoo.com",
  "consent.yahoo.com",
]);

export default {
  async fetch(request) {
    const targetHost = request.headers.get("X-Proxy-Target");
    if (!targetHost || !ALLOWED_HOSTS.has(targetHost)) {
      return new Response("Missing or disallowed X-Proxy-Target", { status: 400 });
    }

    const url = new URL(request.url);
    const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

    let cookie;
    try {
      cookie = await getCookie();
    } catch (e) {
      return new Response(`cookie error: ${e.message}`, { status: 502 });
    }

    let resp = await relay(targetUrl, request.method, cookie);

    if (resp.status === 401 || resp.status === 429) {
      // Session likely stale — refresh once and retry before giving up.
      cachedCookie = null;
      try {
        cookie = await getCookie();
      } catch (e) {
        return new Response(`cookie refresh error: ${e.message}`, { status: 502 });
      }
      resp = await relay(targetUrl, request.method, cookie);
    }

    const respHeaders = new Headers(resp.headers);
    respHeaders.delete("set-cookie");
    respHeaders.delete("content-encoding");
    respHeaders.delete("content-length");
    return new Response(resp.body, { status: resp.status, headers: respHeaders });
  },
};
