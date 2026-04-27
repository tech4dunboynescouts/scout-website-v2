import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-8xl mb-6">⚜️</div>

        <h1 className="font-display font-bold text-white text-5xl sm:text-6xl mb-4">
          Lost in the woods?
        </h1>

        <p className="font-body text-white/60 text-lg leading-relaxed mb-3">
          It looks like this link is broken or the page has moved. Even the best navigators lose their way sometimes.
        </p>

        <p className="font-body text-white/40 text-sm mb-10">
          Error 404 &mdash; Page not found
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-main hover:bg-orange-hover text-white font-body font-semibold rounded-lg transition-colors"
          >
            Back to Home <ArrowRight size={16} />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/20 hover:border-white/50 text-white/70 hover:text-white font-body font-semibold rounded-lg transition-colors"
          >
            <MapPin size={16} /> Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
