import { getPackageVersion } from "@/lib/version";
import { siteUrls } from "@n3wth/site-config";

interface JsonLdProps {
  type: "WebSite" | "SoftwareApplication" | "WebPage" | "BreadcrumbList";
  data?: {
    name?: string;
    description?: string;
    url?: string;
    items?: { name: string; url: string }[];
  };
}

export function JsonLd({ type, data }: JsonLdProps) {
  const version = getPackageVersion();

  const baseUrl = siteUrls.r3;

  const schemas: Record<string, object> = {
    WebSite: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "r3",
      alternateName: "n3wth/r3",
      url: baseUrl,
      description:
        "Persistent memory for AI assistants. An MCP server that gives Gemini memory that survives between sessions.",
      publisher: {
        "@type": "Person",
        name: "Oliver Newth",
        url: "https://n3wth.com",
      },
    },
    SoftwareApplication: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "r3",
      alternateName: "n3wth/r3",
      description:
        "An MCP server that gives AI assistants persistent memory across sessions. Local Redis, vector search, and knowledge graphs with zero configuration.",
      url: baseUrl,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Windows, Linux",
      softwareVersion: version,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Person",
        name: "Oliver Newth",
        url: "https://n3wth.com",
      },
      programmingLanguage: ["TypeScript", "JavaScript"],
      runtimePlatform: "Node.js",
      installUrl: "https://www.npmjs.com/package/@n3wth/r3",
      downloadUrl: "https://www.npmjs.com/package/@n3wth/r3",
      codeRepository: "https://github.com/n3wth/r3",
      keywords: [
        "MCP",
        "AI memory",
        "Gemini",
        "Redis",
        "vector search",
        "knowledge graph",
      ],
    },
    WebPage: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: data?.name || "r3 Documentation",
      description:
        data?.description ||
        "Documentation for r3, the persistent memory MCP server for AI assistants.",
      url: data?.url || `${baseUrl}/docs`,
      isPartOf: {
        "@type": "WebSite",
        name: "r3",
        url: baseUrl,
      },
      publisher: {
        "@type": "Person",
        name: "Oliver Newth",
        url: "https://n3wth.com",
      },
    },
    BreadcrumbList: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: (data?.items || []).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  };

  const schema = schemas[type];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
