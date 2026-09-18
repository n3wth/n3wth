"use client";

import { Icon } from "@n3wth/ui";
import { SiteNavigation } from "@n3wth/ui/site";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocsNavigationLinks } from "./DocsNavigationLinks";
import { DocsSearchTrigger } from './DocsSearch';

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
          <a href="https://n3wth.com" aria-label="n3wth home">n3wth</a>
          <span aria-hidden="true">/</span>
          <Link href="/" aria-label="r3 home">r3</Link>
          {isDocs && <>
            <span aria-hidden="true">/</span>
            <Link href="/docs" aria-label="Documentation home">docs</Link>
          </>}
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
        <>
        {isDocs && <DocsSearchTrigger compact />}
        <a
          href="https://github.com/n3wth/r3"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on GitHub"
        >
          <Icon name="github" size="md" />
        </a>
        </>
      }
    />
  );
}
