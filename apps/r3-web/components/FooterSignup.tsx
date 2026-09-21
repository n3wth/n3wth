"use client";

import posthog from "posthog-js";
import { useState } from "react";
import { submitNewsletter, newsletterErrorMessage } from "@n3wth/site-config/newsletter";
import { captureNewsletterSubscribed } from "@n3wth/site-config/analytics";
import { SiteSignup } from "@n3wth/ui/site";

export function FooterSignup() {
  const [errorMessage, setErrorMessage] = useState<string>();
  async function subscribe(address: string) {
    try {
      await submitNewsletter(address, "r3", { endpoint: process.env.NEXT_PUBLIC_SUBSCRIBE_ENDPOINT });
    } catch (error) {
      setErrorMessage(newsletterErrorMessage(error));
      throw error;
    }
    captureNewsletterSubscribed(posthog, "r3");
  }
  return <SiteSignup onSubmit={subscribe} errorMessage={errorMessage} />;
}
