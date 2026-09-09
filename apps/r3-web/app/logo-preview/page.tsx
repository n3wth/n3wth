import LogoAccentOptions from "@/components/LogoAccentOptions";
import type { Metadata } from "next";
import { pageMetadata } from "@n3wth/site-config/metadata";

export const metadata: Metadata = {
  ...pageMetadata({ title: "Logo preview", description: "Internal comparison of r3 logo treatments.", url: "https://r3.n3wth.com/logo-preview" }),
  robots: { index: false, follow: false },
};

export default function LogoPreviewPage() {
  return <LogoAccentOptions />;
}
