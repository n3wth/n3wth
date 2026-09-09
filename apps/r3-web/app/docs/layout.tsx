import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { DocsSidebar } from "@/components/DocsSidebar";
import { TableOfContents } from "@/components/TableOfContents";
import Link from "next/link";
import { SiteSectionLinks } from "@n3wth/ui/site";
import { docsConfig } from "@/lib/docs-config";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navigation />

      <div className="mx-auto max-w-[1440px] w-full px-6 pt-28 pb-14 lg:px-10 flex-1">
        <div className="lg:hidden mb-8">
        <SiteSectionLinks aria-label="Documentation sections">
          {docsConfig.map(section => (
            <Link key={section.title} href={`/docs/${section.items[0].slug}`}>
              {section.title}
            </Link>
          ))}
        </SiteSectionLinks>
        </div>
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[220px] flex-shrink-0">
            <div className="sticky top-20">
              <DocsSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main id="main-content" className="min-w-0 max-w-4xl flex-grow">
            {children}
          </main>

          {/* Table of Contents */}
          <aside className="hidden xl:block w-[200px] flex-shrink-0">
            <div className="sticky top-20">
              <TableOfContents />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
