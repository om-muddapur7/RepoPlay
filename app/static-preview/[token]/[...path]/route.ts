import { serveStaticAsset } from "../../../../lib/static-preview";

export async function GET(request: Request, { params }: { params: Promise<{ token: string; path: string[] }> }) {
  const { token, path } = await params;
  return serveStaticAsset(request, token, path, process.env.PREVIEW_SIGNING_SECRET);
}
