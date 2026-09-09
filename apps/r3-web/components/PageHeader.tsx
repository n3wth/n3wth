"use client";

import { PageHeader as SharedPageHeader, SiteContainer } from '@n3wth/ui/site';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return <SiteContainer><SharedPageHeader title={title} description={subtitle} actions={children} /></SiteContainer>;
}
