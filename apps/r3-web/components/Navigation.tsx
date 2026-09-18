"use client";

import { Icon } from "@n3wth/ui";
import { SiteNavigation } from "@n3wth/ui/site";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocsNavigationLinks } from "./DocsNavigationLinks";

const navigation = [{ name: "Docs", href: "/docs" }];

export function Navigation() {
  const pathname = usePathname();
  const isDocs = pathname === "/docs" || pathname.startsWith("/docs/");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <SiteNavigation
      key={pathname}
      collapseAt={isDocs ? "lg" : "md"}
      navigationLabel={isDocs ? "Documentation" : "Primary"}
      menuLabel={isDocs ? "Open documentation menu" : "Open menu"}
      menuContent={isDocs ? <DocsNavigationLinks /> : undefined}
      brand={
        <span className="inline-flex items-center">
          <Link href="/" aria-label="n3wth/r3 - home">
            n3wth/r3
          </Link>
          {isDocs && <Link href="/docs" aria-label="Documentation home">/docs</Link>}
        </span>
      }
      links={isDocs ? null : navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          {item.name}
        </Link>
      ))}
      actions={
        <a
          href="https://github.com/n3wth/r3"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on GitHub"
        >
          <Icon name="github" size="md" />
        </a>
      }
    />
  );
}
