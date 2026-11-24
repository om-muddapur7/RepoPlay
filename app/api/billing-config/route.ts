export function GET() {
  return Response.json({ publishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? null }, {
    headers: { "Cache-Control": "no-store" },
  });
}
