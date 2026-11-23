import { signInPage } from "../../lib/repoplay-auth";

export function GET(request: Request) {
  return signInPage(request, process.env);
}
