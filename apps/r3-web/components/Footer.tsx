"use client";

import { SiteFooter } from "@n3wth/ui/site";
import Link from "next/link";
import { siteUrls } from "@n3wth/site-config";

const products = [
  { label: "hop.flights", href: siteUrls.hop, external: true },
  { label: "ui", href: siteUrls.ui, external: true },
  { label: "kit", href: siteUrls.kit, external: true },
  { label: "garden", href: siteUrls.garden, external: true },
  { label: "skills", href: siteUrls.skills, external: true },
  { label: "n3wth.com", href: siteUrls.home, external: true },
  { label: "Email", href: "mailto:hey@n3wth.com", external: false },
];

export function Footer() {
  return (
    <SiteFooter
      brand={<Link href="/">n3wth/r3</Link>}
      links={products.map((link) => (
        <a
          key={link.href}
          href={link.href}
          {...(link.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {link.label}
        </a>
      ))}
    >
      <p>© 2026 Oliver Newth</p>
    </SiteFooter>
  );
}
