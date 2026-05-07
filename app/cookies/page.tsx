import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Cookie Notice",
  description:
    "Learn how 1st Meath Dunboyne Scout Group uses cookies and analytics on this website.",
};

export default function CookieNoticePage() {
  return (
    <>
      <PageHero
        title="Cookie Notice"
        subtitle="How we use cookies and similar technologies on this website."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cookie Notice" }]}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-8">
          <div className="space-y-3">
            <h2 className="font-display font-bold text-navy-dark text-2xl">What We Use</h2>
            <p className="font-body text-textMuted text-sm leading-relaxed">
              This website uses essential cookies to support core functionality such as secure leader sign-in. We also use always-on analytics to understand how visitors use the site and to improve content and user experience.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display font-bold text-navy-dark text-xl">Essential Cookies</h3>
            <p className="font-body text-textMuted text-sm leading-relaxed">
              Essential cookies are required for key parts of the site to work, including authentication and security features for the leaders portal.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display font-bold text-navy-dark text-xl">Analytics</h3>
            <p className="font-body text-textMuted text-sm leading-relaxed">
              We use analytics tooling to collect aggregate usage information such as page visits and interaction trends. This helps us understand which pages are useful and where we can improve the website.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display font-bold text-navy-dark text-xl">Questions</h3>
            <p className="font-body text-textMuted text-sm leading-relaxed">
              If you have any questions about this Cookie Notice, please contact us at tech4dunboynescouts@gmail.com.
            </p>
          </div>

          <p className="font-body text-xs text-textMuted">Last updated: 7 May 2026</p>
        </div>
      </section>
    </>
  );
}
