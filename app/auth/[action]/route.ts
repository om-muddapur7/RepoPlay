import { handleAuth } from "../../../lib/repoplay-auth";

type Context = { params: Promise<{ action: string }> };

async function authRoute(request: Request, { params }: Context) {
  const { action } = await params;
  return handleAuth(request, action, process.env);
}

export { authRoute as GET, authRoute as POST };
