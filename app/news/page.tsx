import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import NewsFilterGrid from "@/components/NewsFilterGrid";
import { client } from "@/sanity/lib/client";
import { allNewsQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "News & Events",
  description:
    "The latest from 1st Meath Dunboyne — adventures, achievements, and upcoming activities.",
};

export const revalidate = 60;

export default async function NewsPage() {
  const articles: {
    _id: string;
    slug: string;
    title: string;
    date: string;
    tag: string;
    excerpt: string;
    image: string;
  }[] = await client.fetch(allNewsQuery).catch(() => []);

  return (
    <>
      <PageHero
        title="News & Events"
        subtitle="The latest from 1st Meath Dunboyne — adventures, achievements, and upcoming activities."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "News & Events" }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <NewsFilterGrid articles={articles} />
      </section>
    </>
  );
}
