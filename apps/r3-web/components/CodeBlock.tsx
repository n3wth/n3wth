"use client";

import { CodeBlock as SharedCodeBlock } from "@n3wth/ui";

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const lang = language || className?.match(/(?:^|\s)language-([^\s]+)/)?.[1] || "text";
  const code = children.trim();
  return <SharedCodeBlock code={code} language={lang} size="sm" showLineNumbers={false} showLanguageLabel={false} showCopyButton />;
}
