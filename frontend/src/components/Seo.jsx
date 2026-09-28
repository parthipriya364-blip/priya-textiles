import { useEffect } from "react";

export const SITE_URL = "https://www.priyatextiles.com";
export const SITE_NAME = "PRIYA TEXTILES";

const cleanText = (value = "") => value.replace(/\s+/g, " ").trim();

function setMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export default function Seo({
  title,
  description,
  path = "/",
  noindex = false,
  image,
  type = "website",
  jsonLd,
}) {
  useEffect(() => {
    const fullTitle = title.includes("PRIYA TEXTILES") ? title : `${title} | PRIYA TEXTILES`;
    const pageDescription = cleanText(description);
    const canonical = new URL(path, SITE_URL).href;

    document.title = fullTitle;
    setMeta('meta[name="description"]', { name: "description" }, pageDescription);
    setMeta('meta[name="robots"]', { name: "robots" }, noindex ? "noindex, nofollow" : "index, follow");
    setLink("canonical", canonical);

    setMeta('meta[property="og:title"]', { property: "og:title" }, fullTitle);
    setMeta('meta[property="og:description"]', { property: "og:description" }, pageDescription);
    setMeta('meta[property="og:url"]', { property: "og:url" }, canonical);
    setMeta('meta[property="og:type"]', { property: "og:type" }, type);
    setMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
    if (image) setMeta('meta[property="og:image"]', { property: "og:image" }, image);

    setMeta('meta[name="twitter:card"]', { name: "twitter:card" }, image ? "summary_large_image" : "summary");
    setMeta('meta[name="twitter:title"]', { name: "twitter:title" }, fullTitle);
    setMeta('meta[name="twitter:description"]', { name: "twitter:description" }, pageDescription);
    if (image) setMeta('meta[name="twitter:image"]', { name: "twitter:image" }, image);

    const existing = document.head.querySelector('script[data-seo-jsonld="true"]');
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoJsonld = "true";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const currentJsonLd = document.head.querySelector('script[data-seo-jsonld="true"]');
      if (currentJsonLd) currentJsonLd.remove();
    };
  }, [description, image, jsonLd, noindex, path, title, type]);

  return null;
}

export function buildBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).href,
    })),
  };
}
