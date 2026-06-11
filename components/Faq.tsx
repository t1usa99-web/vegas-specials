export type FaqItem = { q: string; a: string };

export default function Faq({ items }: { items: FaqItem[] }) {
  if (!items || items.length === 0) return null;
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  return (
    <section className="faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <h2 className="faq-title">Frequently asked questions</h2>
      {items.map((it, i) => (
        <details key={i} className="faq-item">
          <summary className="faq-q">{it.q}</summary>
          <div className="faq-a">{it.a}</div>
        </details>
      ))}
    </section>
  );
}
