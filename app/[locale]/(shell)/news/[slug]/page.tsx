import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Script from "next/script";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { newsItems } from "@/lib/data/news";
import { newsHref, ROUTES, SITE } from "@/lib/paths";
import { formatDate } from "@/lib/format";
import { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";

type Params = Promise<{ slug: string; locale: string }>;

export function generateStaticParams() {
  return newsItems.map((item) => ({ slug: item.slug }));
}

function articleKey(slug: string): "items.trust-wallet-deposit" | "items.bank-card-deposit" {
  if (slug === "trust-wallet-deposit") return "items.trust-wallet-deposit";
  if (slug === "bank-card-deposit") return "items.bank-card-deposit";
  return "items.trust-wallet-deposit";
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) return {};
  const t = await getTranslations({ locale, namespace: "newsArticles" });
  const pk = articleKey(slug);
  const articlePath = newsHref(item.slug);
  const languages = alternateLanguageUrls(articlePath);
  const title = t(`${pk}.title`);
  const description = t(`${pk}.excerpt`);
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl(locale, articlePath),
      languages,
    },
    openGraph: {
      title,
      description,
      images: [item.image],
      type: "article",
      publishedTime: item.publishedAt,
      authors: [t("editorialAuthor")],
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Params }) {
  const { slug, locale } = await params;
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) notFound();

  const t = await getTranslations({ locale, namespace: "newsArticles" });
  const pk = articleKey(slug);
  const title = t(`${pk}.title`);
  const excerpt = t(`${pk}.excerpt`);
  const body = t(`${pk}.body`);
  const category = t(`${pk}.category`);
  const author = t("editorialAuthor");

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: excerpt,
    image: [`${SITE.url}${item.image}`],
    datePublished: item.publishedAt,
    author: { "@type": "Organization", name: author },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/assets/brand/logo-full.png`,
      },
    },
  };

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href={ROUTES.news}
        className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-text-muted)] transition-colors hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("backToNews")}
      </Link>
      <span className="eyebrow mt-4 inline-block !text-[var(--color-brand)]">
        {category} ·{" "}
        <span className="numeric">{formatDate(item.publishedAt)}</span>
      </span>
      <h1 className="h1 mt-2">{title}</h1>
      <p className="lead mt-3 text-base">{excerpt}</p>
      <div className="relative mt-6 h-72 w-full overflow-hidden rounded-2xl bg-[var(--color-panel)]">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>
      <div className="mt-6 rounded-2xl bg-[var(--color-panel)] p-6 sm:p-8">
        <p className="text-sm font-medium leading-relaxed text-[var(--color-text-muted)] sm:text-base">
          {body}
        </p>
        <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--color-text-muted)] sm:text-base">
          {t("footerBlurb")}
        </p>
        <p className="eyebrow mt-4">{t("byAuthor", { author })}</p>
      </div>
      <Script
        id={`schema-news-${item.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </article>
  );
}
