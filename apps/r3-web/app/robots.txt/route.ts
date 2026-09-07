import { siteUrls } from "@n3wth/site-config";

export async function GET() {
  const content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /logo-preview

Sitemap: ${siteUrls.r3}/sitemap.xml
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
