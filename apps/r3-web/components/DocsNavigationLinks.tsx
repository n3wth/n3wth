"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsConfig } from "@/lib/docs-config";

export function DocsNavigationLinks() {
  const pathname = usePathname();

  return (
    <div className="grid gap-4 p-2 sm:grid-cols-2">
      {docsConfig.map((section) => (
        <div key={section.title}>
          <div className="mb-1 px-3 text-sm font-medium text-ink-label">{section.title}</div>
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
    </div>
  );
}
