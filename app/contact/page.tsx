import type { Metadata } from "next";
import { MapPin, Mail } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/SocialIcons";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import { buildSocialMetadata } from "@/lib/socialMetadata";

export const metadata: Metadata = buildSocialMetadata({
  title: "Contact Us",
  description:
    "Get in touch with 1st Meath Dunboyne Scout Group. Find us on Rooske Road, Dunboyne, Co. Meath, or email secretarydunboynescouts@gmail.com.",
  canonicalPath: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Got a question? We'd love to hear from you. Reach out via the form, email, or find us on social media."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info + map */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display font-bold text-navy-dark text-2xl mb-6">Find us</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-orange-main/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-orange-main" />
                  </div>
                  <div>
                    <h3 className="font-body font-semibold text-navy-dark text-sm mb-1">Address</h3>
                    <p className="font-body text-textMuted text-sm">
                      Rooske Road, Dunboyne<br />
                      Co. Meath, Ireland<br />
                      Eircode: A86 NV07
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-orange-main/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-orange-main" />
                  </div>
                  <div>
                    <h3 className="font-body font-semibold text-navy-dark text-sm mb-1">Email</h3>
                    <a
                      href="mailto:secretarydunboynescouts@gmail.com"
                      className="font-body text-textMuted text-sm hover:text-navy-dark transition-colors"
                    >
                      secretarydunboynescouts@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h2 className="font-display font-bold text-navy-dark text-2xl mb-4">Follow us</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="https://www.facebook.com/groups/811773582630420"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md text-navy-dark hover:text-orange-main transition-all font-body text-sm font-medium"
                >
                  <FacebookIcon size={18} /> Facebook
                </a>
                <a
                  href="https://www.instagram.com/dunboyne_scouts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md text-navy-dark hover:text-orange-main transition-all font-body text-sm font-medium"
                >
                  <InstagramIcon size={18} /> Instagram
                </a>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md text-navy-dark hover:text-orange-main transition-all font-body text-sm font-medium"
                >
                  <YoutubeIcon size={18} /> YouTube
                </a>
              </div>
            </div>

            {/* Map */}
            <div>
              <h2 className="font-display font-bold text-navy-dark text-2xl mb-4">Our location</h2>
              <MapEmbed />
            </div>
          </div>

          {/* Form */}
          <div className="lg:pt-14">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
