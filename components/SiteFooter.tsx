import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const link = { color: "inherit", textDecoration: "none", opacity: 0.85 } as const;
  return (
    <footer style={{ marginTop: 40, padding: "28px 18px 96px", borderTop: "1px solid rgba(0,0,0,0.08)", background: "#fafafa", fontSize: 13, color: "#666", textAlign: "center", lineHeight: 1.9 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", justifyContent: "center", marginBottom: 12 }}>
          <Link href="/legal/about" style={link}>About</Link>
          <Link href="/legal/contact" style={link}>Contact</Link>
          <Link href="/legal/privacy" style={link}>Privacy</Link>
          <Link href="/legal/terms" style={link}>Terms</Link>
          <Link href="/legal/cookies" style={link}>Cookies</Link>
          <Link href="/legal/disclosure" style={link}>Advertising Disclosure</Link>
          <Link href="/blog" style={link}>Blog</Link>
        </div>
        <div style={{ opacity: 0.8 }}>Prices and deals change constantly — always confirm with the venue. Gaming data is statistical, not a prediction. Please play responsibly: 1-800-GAMBLER.</div>
        <div style={{ marginTop: 8, opacity: 0.7 }}>© {year} VegasOnTap · VegasSpecials. Supported by advertising &amp; affiliate partnerships (<Link href="/legal/disclosure" style={link}>disclosure</Link>).</div>
      </div>
    </footer>
  );
}
