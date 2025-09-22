export function checkRoutes(known: string[], present: string[]) {
  const missing = known.filter(k => !present.includes(k));
  if (missing.length) console.warn("[RouteCheck] Missing routes:", missing);
}