export function GET(request: Request) {
  return Response.redirect(new URL("/sign-in", request.url), 307);
}
