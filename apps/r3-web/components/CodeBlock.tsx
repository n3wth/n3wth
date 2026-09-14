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
  const multiline = code.includes("\n");
  const numbered = multiline && !["bash", "sh", "shell", "console", "text"].includes(lang);
  return <SharedCodeBlock code={code} language={lang} size="sm" showLineNumbers={numbered} showLanguageLabel={multiline} showCopyButton />;
}
