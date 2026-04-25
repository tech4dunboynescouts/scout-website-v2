import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "1st Meath Dunboyne Scout Group",
    template: "%s | 1st Meath Dunboyne Scouts",
  },
  description:
    "1st Meath Dunboyne Scout Group — a community scouting organisation in Dunboyne, Co. Meath, Ireland. Beavers, Cubs, Scouts, Ventures, and a unique Water Section. Founded 1973.",
  keywords: ["scouts", "dunboyne", "meath", "beavers", "cubs", "scouting ireland", "youth group"],
  openGraph: {
    type: "website",
    locale: "en_IE",
    siteName: "1st Meath Dunboyne Scout Group",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="bg-background font-body antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
