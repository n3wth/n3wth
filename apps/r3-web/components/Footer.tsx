import { SiteFooter } from "@n3wth/ui/site";
import { FooterSignup } from "./FooterSignup";

export function Footer() {
  return <SiteFooter sourceHref="https://github.com/n3wth/r3" signup={<FooterSignup />} />;
}
