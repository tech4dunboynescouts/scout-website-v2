import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { filterNavItemsByRouteToggles, type RouteToggle } from "@/lib/routeToggles";
import { siteUrl } from "@/lib/siteConfig";
import { client } from "@/sanity/lib/client";
import { siteFeatureFlagsQuery, siteNavigationQuery } from "@/sanity/lib/queries";
import type { NavItem } from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "1st Meath Dunboyne Scout Group",
    template: "%s | 1st Meath Dunboyne Scouts",
  },
  description:
    "1st Meath Dunboyne Scout Group, a community scouting organisation in Dunboyne, Co. Meath, Ireland. Beavers, Cubs, Scouts, Ventures, and a unique Water Section. Founded 1973.",
  keywords: ["scouts", "dunboyne", "meath", "beavers", "cubs", "scouting ireland", "youth group"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IE",
    siteName: "1st Meath Dunboyne Scout Group",
    url: siteUrl,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "1st Meath Dunboyne Scout Group social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@dunboyne_scouts",
    images: ["/opengraph-image"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "1st Meath Dunboyne Scout Group",
  url: siteUrl,
  logo: `${siteUrl}/images/logo.jpg`,
  description:
    "Community scouting organisation in Dunboyne, Co. Meath, Ireland. Beavers, Cubs, Scouts, Ventures, and a Water Section. Founded 1973.",
  foundingDate: "1973",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rooske Road",
    addressLocality: "Dunboyne",
    addressRegion: "Co. Meath",
    postalCode: "A86 NV07",
    addressCountry: "IE",
  },
  email: "secretarydunboynescouts@gmail.com",
  sameAs: [
    "https://www.facebook.com/groups/811773582630420",
    "https://www.instagram.com/dunboyne_scouts",
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [navData, featureFlags] = await Promise.all([
    client
      .fetch(siteNavigationQuery)
      .catch(() => null) as Promise<{ navItems: NavItem[] } | null>,
    client
      .fetch(siteFeatureFlagsQuery)
      .catch(() => null) as Promise<{ routes?: RouteToggle[] } | null>,
  ]);

  const routeToggles = featureFlags?.routes ?? [];
  const rawNavItems = navData?.navItems ?? undefined;
  const navItems = rawNavItems
    ? filterNavItemsByRouteToggles(rawNavItems, routeToggles)
    : undefined;

  return (
    <html lang="en" className={roboto.variable} data-scroll-behavior="smooth">
      <body className="bg-background font-body antialiased">
        <ScrollRestoration />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <ConditionalLayout navItems={navItems}>{children}</ConditionalLayout>
        <Analytics />
      </body>
    </html>
  );
}

