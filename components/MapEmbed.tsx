export default function MapEmbed() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <iframe
        title="1st Meath Dunboyne Scout Den location"
        width="100%"
        height="320"
        style={{ border: 0, display: "block" }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-6.4815%2C53.4064%2C-6.4666%2C53.4164&layer=mapnik&marker=53.411416%2C-6.474048"
      />
      <a
        href="https://www.openstreetmap.org/#map=18/53.411416/-6.474048"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-xs font-body text-textMuted text-center py-2 bg-gray-50 hover:text-navy-dark transition-colors"
      >
        View larger map ↗
      </a>
    </div>
  );
}
