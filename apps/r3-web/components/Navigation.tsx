"use client";

import { Icon } from "@n3wth/ui";
import { SiteNavigation } from "@n3wth/ui/site";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [{ name: "Docs", href: "/docs" }];

export function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <SiteNavigation
      brand={
        <Link href="/" aria-label="n3wth/r3 - home">
          n3wth/r3
        </Link>
      }
      links={navigation.map((item) => (
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
