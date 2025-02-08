# cf-proxy-example

This is a minimal example of a Cloudflare Worker that proxies requests while changing the request headers, including the ones with IP addresses.

Some services only use the IP address information of the headers to determine the location of the user. This worker changes the IP address of the request to a different one, which can be useful for bypassing certain restrictions.

## Features

- Changes the IP address of the request to a random one, including:
  `CF-Connecting-IP`, `X-Forwarded-For`, `X-Forwarded`, `X-Client-IP`
- Changes the `User-Agent` and `Referer` headers of the request to a random one.

## Disclaimer

The "@threadseeker/cf-proxy-example" was developed for educational and research purposes only. It's clear that abusing the code for illegal or unethical purposes might violate the terms of service of Cloudflare, the target service or the law of your region.

Any actions or activities related to the material contained within this repository are solely the user's responsibility. The author and contributors of this repository do not support or condone any unethical or illegal activities.

## Setup

```bash
git clone https://github.com/threadseeker/cf-proxy-example.git
cd cf-proxy-example

# Install the dependencies
pnpm install
```

## Local Development

Run the worker locally with:

```bash
pnpm dev
```

The worker will be available at `http://localhost:8787`

## Testing

The repo comes with certain tests to cover the most important parts of the code. Run them with:

```bash
pnpm test
```

And the unit tests are available at `./tests`

## Deployment

To deploy the worker, run:

```bash
npx wrangler deploy
```

## Additional Information

### It is not safe to determine the visitor's IP address only from the headers

With the perspective of the target service, it's not solid to determine the visitor's real IP address only from the headers, since they could be modified by the clients. Like this example, the worker changes the headers to a random one, so the target service could be misleaded if only based on the headers.

### Identify requests coming from Cloudflare Workers

There're 2 headers can be used to determine if the request is coming from a Cloudflare worker and cannot be spoofed:

1. The [`CF-Worker`](https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-worker) header, which is set to the name of the zone which owns the Worker making the subrequest (fetch)
2. The [`CF-Ray`](https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-ray) header, which can be used to match requests proxied to Cloudflare to requests in your server logs.

The 2 headers are injected by Cloudflare once a subrequest is made from a Cloudflare worker, and cannot be modified anyway by the client.

If you are a developer that want to protect your service from being abused by this kind of workers, you can use the 2 headers mentioned above to detect, [report](https://abuse.cloudflare.com/) or block the requests.

### Preventing the requests try to bypassing Cloudflare's protection utilizing Cloudflare Workers

It is possible that the Cloudflare Workers could be abused to bypass Cloudflare's protection with certain techniques.

However, according to this [comment](https://news.ycombinator.com/item?id=26688390) from Cloudflare's tech lead:

> Instead of IP-based authentication, we strongly recommend using mTLS-based authenticated origin pulls (with a zone-specific key pair) or Argo Tunnel, as these methods are much more secure.

Preventing the requests try to bypassing Cloudflare's protection utilizing Cloudflare Workers is doable with mTLS-based authenticated origin pulls or Argo Tunnel with Cloudflare.

### Conclusion

Overall, this worker is just a minimal example of a Cloudflare Worker that proxies requests while changing the request headers, including the ones with IP addresses.

Yet, there are still many other ways to determined those requests with the default headers from Cloudflare Workers to avoid abused as a targeted service. Also, the CDN has no way of knowing if the origin server that a user has configured really belongs to them, so setting mTLS-based authenticated origin pulls or Argo Tunnel with Cloudflare is recommended for advanced protection.
