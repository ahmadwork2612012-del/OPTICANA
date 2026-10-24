import net from "node:net";

// Published at https://www.cloudflare.com/ips/
const CLOUDFLARE_RANGES = [
  "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
  "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20",
  "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
  "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
  "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32",
  "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32",
];

const cloudflare = new net.BlockList();
for (const range of CLOUDFLARE_RANGES) {
  const [address, prefix] = range.split("/");
  cloudflare.addSubnet(address, Number(prefix), net.isIPv6(address) ? "ipv6" : "ipv4");
}

function normalize(ip) {
  const value = String(ip || "").trim();
  return value.startsWith("::ffff:") ? value.slice(7) : value;
}

function firstHeaderValue(value) {
  return normalize(String(Array.isArray(value) ? value[0] : value || "").split(",")[0]);
}

function isCloudflare(ip) {
  const type = net.isIP(ip);
  if (!type) return false;
  return cloudflare.check(ip, type === 6 ? "ipv6" : "ipv4");
}

/*
  The address of the visitor, not of a proxy in front of the API.

  - On Vercel, the platform overwrites x-vercel-forwarded-for / x-real-ip with
    the address that connected to it, so clients cannot forge them.
  - When that address belongs to Cloudflare, the request came through the
    Cloudflare proxy and CF-Connecting-IP holds the visitor. The header is
    ignored otherwise, because anyone calling the API directly can set it.
*/
export function getClientIp(req) {
  const headers = req.headers || {};
  const peer = process.env.VERCEL
    ? firstHeaderValue(headers["x-vercel-forwarded-for"] || headers["x-real-ip"]) || normalize(req.socket?.remoteAddress)
    : normalize(req.socket?.remoteAddress);

  const cfIp = firstHeaderValue(headers["cf-connecting-ip"]);
  if (cfIp && net.isIP(cfIp) && isCloudflare(peer)) return cfIp;

  return peer || "unknown";
}
