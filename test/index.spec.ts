// test/index.spec.ts
import { createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";
import { generateRandomIP, generateRandomUserAgent, generateRandomReferer } from "../src/index";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;
const TESTING_ENDPOINT = "http://example.com/ip";

const env = {
  PROXY_TARGET_URL: "https://httpbin.org",
};

describe("Helper functions", () => {
  describe("generateRandomIP", () => {
    it("should generate valid IP address format", () => {
      const ip = generateRandomIP();
      expect(ip).toMatch(/^(\d{1,3}\.){3}\d{1,3}$/);

      // Verify each octet is between 0-255
      const octets = ip.split(".");
      octets.forEach((octet) => {
        const num = parseInt(octet);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(255);
      });
    });

    it("should generate different IPs on multiple calls", () => {
      const ip1 = generateRandomIP();
      const ip2 = generateRandomIP();
      expect(ip1).not.toBe(ip2);
    });
  });

  describe("generateRandomUserAgent", () => {
    it("should return a non-empty string", () => {
      const userAgent = generateRandomUserAgent();
      expect(typeof userAgent).toBe("string");
      expect(userAgent.length).toBeGreaterThan(0);
    });

    it("should return a valid user agent string", () => {
      const userAgent = generateRandomUserAgent();
      expect(userAgent).toMatch(/Mozilla\/5.0/);
    });
  });

  describe("generateRandomReferer", () => {
    it("should return a valid URL", () => {
      const referer = generateRandomReferer();
      expect(() => new URL(referer)).not.toThrow();
    });

    it("should return a known search engine URL", () => {
      const referer = generateRandomReferer();
      const validDomains = ["google.com", "bing.com", "yahoo.com", "duckduckgo.com"];
      expect(validDomains.some((domain) => referer.includes(domain))).toBe(true);
    });
  });
});

describe("Proxy worker", () => {
  it("responds with Hello World! (unit style)", async () => {
    const request = new IncomingRequest(TESTING_ENDPOINT);
    // Create an empty context to pass to `worker.fetch()`.
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    await waitOnExecutionContext(ctx);
    const data = await response.json();
    expect(data).toHaveProperty("origin");
  });

  it("responds with Hello World! (integration style)", async () => {
    const response = await SELF.fetch(TESTING_ENDPOINT);
    const data = await response.json();
    expect(data).toHaveProperty("origin");
  });
});
