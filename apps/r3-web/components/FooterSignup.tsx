"use client";

import posthog from "posthog-js";
import { captureNewsletterSubscribed } from "@n3wth/site-config/analytics";
import { SiteSignup } from "@n3wth/ui/site";

export function FooterSignup() {
  return <SiteSignup onSubmit={() => captureNewsletterSubscribed(posthog, "r3")} />;
}
