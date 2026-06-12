// Thin-content gate. A page is "thin" when it has too little real content to be
// worth indexing. Thin pages are set noindex so the site only surfaces substance.
export const THIN = { landing: 3, price: 3 }; // min results to count as substantial

export function robotsMeta(thin: boolean) {
  // Non-thin -> undefined lets the page be indexable (governed by the global
  // preview gate until PUBLIC_LAUNCH=1). Thin -> always noindex.
  return thin ? { robots: { index: false, follow: true } } : undefined;
}
