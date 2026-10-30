import { NextResponse, type NextRequest } from "next/server";

// Vercel provides the visitor's network ASN. This is a best-effort signal:
// common hosting/VPN exit networks are flagged, but residential VPN exits
// cannot always be identified and some legitimate hosted networks may match.
const likelyProxyAsns = new Set([
  "9009",  // M247
  "24940", // Hetzner
  "16276", // OVH
  "14061", // DigitalOcean
  "20473", // Choopa / Vultr
  "60781", // Leaseweb
  "51167", // Contabo
  "63949", // Akamai Connected Cloud / Linode
  "60068", // Datacamp
]);

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const asn = request.headers.get("x-vercel-ip-as-number")?.trim() ?? "";
  const likelyProxy = likelyProxyAsns.has(asn);

  return NextResponse.json(
    { likelyProxy },
    { headers: { "Cache-Control": "no-store, private" } }
  );
}
