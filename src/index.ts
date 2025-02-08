export interface Env {
  PROXY_TARGET_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const modifiedRequest = modifyRequest(request, env.PROXY_TARGET_URL);
    return await fetch(modifiedRequest);
  },
} satisfies ExportedHandler<Env>;

function modifyRequest(request: Request, target: string): Request {
  const url = new URL(request.url);
  const targetUrl = new URL(target);

  // Preserve the original path and search params
  targetUrl.pathname = url.pathname;
  targetUrl.search = url.search;

  // Create new headers with only essential ones
  const headers = new Headers(request.headers);
  for (const [key, value] of request.headers) {
    if (key.toLowerCase() === "content-type" || key.toLowerCase() === "accept") {
      headers.set(key, value);
    }
  }

  // Add spoofed headers
  const randomIP = generateRandomIP();
  // X-Forwarded-For and X-Real-IP are not actually required to be set.
  // Since the workers are using the IPs of Cloudflare's Data Center.

  // Add more headers if you want to.
  headers.set("X-Forwarded-For", randomIP);
  headers.set("X-Real-IP", randomIP);
  headers.set("X-Client-IP", randomIP);
  headers.set("CF-Connecting-IP", randomIP); // CF-Worker cannot be spoofed
  headers.set("User-Agent", generateRandomUserAgent());
  headers.set("Referer", generateRandomReferer());

  return new Request(targetUrl.toString(), {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: "follow",
  });
}

// Helper functions
export function generateRandomIP(): string {
  return Array(4)
    .fill(0)
    .map(() => Math.floor(Math.random() * 255))
    .join(".");
}

export function generateRandomUserAgent(): string {
  const userAgents: string[] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export function generateRandomReferer(): string {
  const referers: string[] = ["https://www.google.com/", "https://www.bing.com/", "https://www.yahoo.com/", "https://www.duckduckgo.com/"];
  return referers[Math.floor(Math.random() * referers.length)];
}
