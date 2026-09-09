"use client";

import { Zap, Code, Lock, Globe, Cpu, Layers } from "lucide-react";
import Link from "next/link";
import {
  PageHeader,
  SiteContainer,
  SiteHeading,
  SiteSection,
  SiteText,
} from "@n3wth/ui/site";
import { lazy, Suspense } from "react";
import { CommandBox as InstallCommand } from "@n3wth/ui";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BentoGrid, BentoCard } from "@/components/BentoGrid";
import { CodeBlock } from "@/components/CodeBlock";
import { JsonLd } from "@/components/JsonLd";

const TerminalDemo = lazy(() =>
  import("@/components/TerminalDemo").then((module) => ({
    default: module.TerminalDemo,
  })),
);

export default function Home() {
  const codeExamples = {
    mcp: `// MCP client config (e.g. .gemini/settings.json)
{
  "mcpServers": {
    "r3": {
      "command": "npx",
      "args": ["@n3wth/r3"]
    }
  }
}`,
    cli: `# MCP CLI tools
gemini mcp add r3 npx -y @n3wth/r3

gemini mcp list`,
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <JsonLd type="SoftwareApplication" />
      <Navigation />

      <main id="main-content" className="flex-1 n3wth-site-main">
        {/* Hero */}
        <SiteContainer>
          <PageHeader
            title="Persistent memory for AI assistants"
            description="An MCP server that gives AI assistants memory that survives between sessions. Local Redis, vector search, and knowledge graphs with zero configuration."
            actions={<InstallCommand command="npx @n3wth/r3" />}
            aside={
              <div className="grid gap-px overflow-hidden rounded-lg border border-rail-strong bg-rail-strong">
                <div className="bg-bg-raise p-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
                    <SiteText variant="supporting">Without r3</SiteText>
                  </div>
                  <pre className="mt-6 overflow-x-auto font-mono text-xs leading-relaxed text-ink-faint">
                    {`> What's my preferred stack?

I don't have any information
about your preferences.`}
                  </pre>
                </div>
                <div className="bg-bg-raise p-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <SiteText variant="supporting">With r3</SiteText>
                  </div>
                  <pre className="mt-6 overflow-x-auto font-mono text-xs leading-relaxed text-ink">
                    {`> What's my preferred stack?

Based on our past conversations:
React + TypeScript, Tailwind,
Postgres with Drizzle ORM.`}
                  </pre>
                </div>
              </div>
            }
          />
        </SiteContainer>

        {/* How it works */}
        <SiteSection className="border-t border-rail">
          <SiteContainer>
            <SiteHeading variant="section" level={2}>
              How it works
            </SiteHeading>
            <SiteText className="mt-6">
              r3 runs a local Redis server with vector search. Your AI stores
              memories as embeddings and retrieves them by meaning, not just
              keywords.
            </SiteText>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-md border border-rail px-3 py-1.5 text-xs font-medium text-ink-dim">
                Semantic search
              </span>
              <span className="inline-flex items-center rounded-md border border-rail px-3 py-1.5 text-xs font-medium text-ink-dim">
                Knowledge graphs
              </span>
              <span className="inline-flex items-center rounded-md border border-rail px-3 py-1.5 text-xs font-medium text-ink-dim">
                Local-only
              </span>
            </div>
          </SiteContainer>
        </SiteSection>

        {/* Terminal demo */}
        <SiteSection className="border-t border-rail">
          <SiteContainer>
            <SiteHeading variant="section" level={2}>
              See it in action
            </SiteHeading>
            <SiteText className="mt-6">
              r3 storing and retrieving memories across sessions.
            </SiteText>
            <div className="mt-6">
              <Suspense
                fallback={
                  <div className="bg-bg-soft rounded-lg p-6 animate-pulse h-64" />
                }
              >
                <TerminalDemo />
              </Suspense>
            </div>
          </SiteContainer>
        </SiteSection>

        {/* Integration */}
        <SiteSection className="border-t border-rail">
          <SiteContainer>
            <SiteHeading variant="section" level={2}>
              Get started
            </SiteHeading>

            <div className="mt-6 grid gap-8 sm:grid-cols-2">
              <div>
                <SiteText variant="supporting">MCP Desktop Clients</SiteText>
                <SiteText className="mt-2">
                  Add r3 to your MCP config file.
                </SiteText>
                <div className="mt-4">
                  <CodeBlock language="json">{codeExamples.mcp}</CodeBlock>
                </div>
              </div>

              <div>
                <SiteText variant="supporting">MCP CLI Tools</SiteText>
                <SiteText className="mt-2">Add with a single command.</SiteText>
                <div className="mt-4">
                  <CodeBlock language="bash">{codeExamples.cli}</CodeBlock>
                </div>
              </div>
            </div>

            <SiteText className="mt-6">
              <Link
                href="/docs/quickstart"
                className="underline underline-offset-4 hover:text-ink"
              >
                Full setup guide
              </Link>
            </SiteText>
          </SiteContainer>
        </SiteSection>

        {/* Features */}
        <SiteSection className="border-t border-rail">
          <SiteContainer>
            <SiteHeading variant="section" level={2}>
              What you get
            </SiteHeading>
            <SiteText className="mt-6">
              r3 runs entirely on your machine. Embedded Redis, vector search,
              and knowledge graphs with no external services.
            </SiteText>

            <div className="mt-6">
              <BentoGrid>
                <BentoCard
                  title="Semantic Search"
                  description="Cosine similarity ranking across 384-dimension vectors. Query by meaning, not keywords."
                  icon={<Cpu className="h-5 w-5 text-ink-dim" />}
                  span="lg:col-span-2"
                />

                <BentoCard
                  title="Knowledge Graph"
                  description="Automatic entity extraction links memories into a traversable graph of relationships."
                  icon={<Layers className="h-5 w-5 text-ink-dim" />}
                />

                <BentoCard
                  title="Fast local reads"
                  description="Embedded Redis serves as both cache layer and vector store. Local embedding generation, no API calls."
                  icon={<Zap className="h-5 w-5 text-ink-dim" />}
                />

                <BentoCard
                  title="MCP compatible"
                  description="Works with any MCP-compatible client. Desktop apps, CLI tools, and custom integrations."
                  icon={<Globe className="h-5 w-5 text-ink-dim" />}
                  span="lg:col-span-2"
                />

                <BentoCard
                  title="TypeScript SDK"
                  description="Typed memory operations, search results, and configuration. Ships its own type declarations."
                  icon={<Code className="h-5 w-5 text-ink-dim" />}
                  span="lg:col-span-2"
                />

                <BentoCard
                  title="Fully local"
                  description="Embedded Redis server, local vector store. No cloud services, no API keys required."
                  icon={<Lock className="h-5 w-5 text-ink-dim" />}
                />
              </BentoGrid>
            </div>
          </SiteContainer>
        </SiteSection>

        {/* Bottom CTA */}
        <SiteSection className="border-t border-rail">
          <SiteContainer>
            <SiteText>Your AI forgets everything between sessions.</SiteText>
            <SiteHeading variant="section" level={2}>
              One command adds persistent memory.
            </SiteHeading>
            <div className="mt-6 flex">
              <InstallCommand command="npx @n3wth/r3" />
            </div>
          </SiteContainer>
        </SiteSection>
      </main>

      <Footer />
    </div>
  );
}
