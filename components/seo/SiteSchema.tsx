import Script from "next/script";
import { routing } from "@/i18n/routing";
import { PUBLISHER } from "@/lib/publisher";
import { SITE } from "@/lib/site";

const publisherOrganization = {
  "@type": "Organization",
  name: PUBLISHER.name,
  url: PUBLISHER.url,
  description: PUBLISHER.description,
  sameAs: [...PUBLISHER.sameAs],
} as const;

export function SiteSchema({
  kind,
  faqEntities,
}: {
  kind: "site" | "faq" | "organization" | "software";
  /** Localized FAQ entries for JSON-LD when `kind` is `faq`. */
  faqEntities?: readonly { question: string; answer: string }[];
}) {
  if (kind === "faq") {
    const entities = faqEntities ?? [];
    const data = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entities.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };
    return (
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  }

  if (kind === "software") {
    const data = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE.name,
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      url: `${SITE.url}/en/games/crash`,
      description: SITE.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      author: publisherOrganization,
      provider: publisherOrganization,
      publisher: publisherOrganization,
    };
    return (
      <Script
        id="schema-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  }

  if (kind === "organization") {
    const data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/assets/brand/logo-full.png`,
      description: SITE.description,
      parentOrganization: publisherOrganization,
      sameAs: [SITE.url],
    };
    return (
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  }

  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: routing.locales,
    publisher: publisherOrganization,
  };
  return (
    <Script
      id="schema-website"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
