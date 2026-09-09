"use client";

import { CodeBlock as SharedCodeBlock } from "@n3wth/ui";

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const lang = language || className?.match(/(?:^|\s)language-([^\s]+)/)?.[1] || "text";
  return <SharedCodeBlock code={children.trim()} language={lang} showLineNumbers showLanguageLabel showCopyButton />;
}
