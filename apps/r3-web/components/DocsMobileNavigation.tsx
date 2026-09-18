"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { docsConfig } from "@/lib/docs-config";

export function DocsMobileNavigation() {
  const pathname = usePathname();

  return (
    <details key={pathname} className="group border-b border-rail">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm text-ink-label [&::-webkit-details-marker]:hidden">
        Browse docs
        <ChevronDown aria-hidden="true" className="h-4 w-4 group-open:rotate-180" />
      </summary>
      <nav aria-label="All documentation" className="grid gap-4 border-t border-rail py-4 sm:grid-cols-2">
        {docsConfig.map((section) => (
          <div key={section.title}>
            <div className="mb-1 text-sm font-medium text-ink-label">{section.title}</div>
            <ul className="list-none p-0">
              {section.items.map((item) => {
                const href = `/docs/${item.slug}`;
                const active = pathname === href || (pathname === "/docs" && item.slug === "introduction");
                return (
                  <li key={item.slug}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center py-2 text-sm hover:text-ink ${active ? "text-ink" : "text-ink-dim"}`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </details>
  );
}
