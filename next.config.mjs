/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // Private preview: noindex everything. At launch (PUBLIC_LAUNCH=1) this drops,
    // and per-page rules (thin pages stay noindex) take over.
    if (process.env.PUBLIC_LAUNCH === "1") return [];
    return [
      { source: "/:path*", headers: [ { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" } ] },
    ];
  },
};
export default nextConfig;
