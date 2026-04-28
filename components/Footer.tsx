import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/SocialIcons";

const footerSections = [
  {
    title: "Sections",
    links: [
      { href: "/sections/beavers", label: "Beavers" },
      { href: "/sections/cubs", label: "Cubs" },
      { href: "/sections/scouts", label: "Scouts" },
      { href: "/sections/ventures", label: "Ventures" },
    ],
  },
  {
    title: "Group",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/leaders", label: "Leader Team 2025/26" },
      { href: "/news", label: "News & Events" },
      { href: "/fundraising", label: "Fundraising" },
      { href: "/resources", label: "Scouter Resources" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { href: "/join", label: "Join as a Youth Member" },
      { href: "/join#volunteer", label: "Volunteer as a Leader" },
      { href: "/contact", label: "Contact Us" },
      { href: "https://www.scouts.ie", label: "Scouting Ireland", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                <Image
                  src="/images/logo.jpg"
                  alt="1st Meath Dunboyne Scout Group logo"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-body font-bold text-base leading-tight">
                  1st Meath Dunboyne
                </div>
                <div className="text-orange-main text-xs font-body">
                  Scout Group
                </div>
              </div>
            </div>
            <p className="text-white/60 text-sm font-body leading-relaxed mb-6 max-w-xs">
              Founded in 1973 and highly active to this day. Two Beaver colonies, three Cub packs, two Scout troops, a Venture unit, and a Water Section serving the whole group.
            </p>
            <div className="space-y-2 text-sm font-body text-white/70">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-orange-main mt-0.5 flex-shrink-0" />
                <span>Rooske Road, Dunboyne, Co. Meath, A86 NV07</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-orange-main flex-shrink-0" />
                <a
                  href="mailto:secretarydunboynescouts@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  secretarydunboynescouts@gmail.com
                </a>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <a
                href="https://www.facebook.com/groups/811773582630420"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 bg-white/10 hover:bg-orange-main rounded-lg flex items-center justify-center transition-colors"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href="https://www.instagram.com/dunboyne_scouts/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 bg-white/10 hover:bg-orange-main rounded-lg flex items-center justify-center transition-colors"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 bg-white/10 hover:bg-orange-main rounded-lg flex items-center justify-center transition-colors"
              >
                <YoutubeIcon size={16} />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-body font-semibold text-xs uppercase tracking-widest text-white/40 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-body text-white/60 hover:text-white transition-colors"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm font-body text-white/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs font-body">
            © {new Date().getFullYear()} 1st Meath Dunboyne Scout Group. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/leaders/login"
              className="text-white/25 hover:text-white/50 text-xs font-body transition-colors"
            >
              Leader Login
            </Link>
            <span className="inline-flex items-center gap-2 text-xs font-body text-white/40 border border-white/10 rounded-full px-3 py-1">
              <span className="text-orange-main">⚜</span>
              Founded 1973
            </span>
            <span className="text-white/40 text-xs font-body">
              Member of Scouting Ireland
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
