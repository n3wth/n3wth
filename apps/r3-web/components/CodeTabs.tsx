"use client";

import { Children, isValidElement, useState, type ReactNode } from "react";
import { CodeBlock, Tabs, TabsList, TabsTab, TabsPanel } from "@n3wth/ui";

interface CodeTab {
  label: string;
  language: string;
  code: string;
}

interface CodeTabsProps {
  tabs?: CodeTab[];
  children?: ReactNode;
}

function parseTabs(children: ReactNode): CodeTab[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode; tab?: string }>(child)) return [];
    const code = child.props.children;
    if (!isValidElement<{ className?: string; children?: ReactNode }>(code)) return [];
    const language = code.props.className?.match(/(?:^|\s)language-([^\s]+)/)?.[1];
    if (!language || typeof code.props.children !== "string") return [];
    return [{
      label: child.props.tab || language.charAt(0).toUpperCase() + language.slice(1),
      language,
      code: code.props.children,
    }];
  });
}

export function CodeTabs({ tabs, children }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState("0");
  const entries = tabs ?? parseTabs(children);
  if (entries.length === 0) return <div className="text-ink-faint">No code tabs available</div>;
  const selected = Number(activeTab) < entries.length ? activeTab : "0";

  return (
    <Tabs value={selected} onChange={setActiveTab}>
      <TabsList aria-label="Code examples">
        {entries.map((tab, index) => <TabsTab key={index} value={String(index)}>{tab.label}</TabsTab>)}
      </TabsList>
      {entries.map((tab, index) => (
        <TabsPanel key={index} value={String(index)}>
          <CodeBlock code={tab.code} language={tab.language} showCopyButton />
        </TabsPanel>
      ))}
    </Tabs>
  );
}
