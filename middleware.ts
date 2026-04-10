import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (url.pathname.startsWith("/dashboard")) {
    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      const expectedUser = process.env.ADMIN_USER || "admin";
      const expectedPassword = process.env.ADMIN_PASSWORD || "812445";

      if (user === expectedUser && pwd === expectedPassword) {
        return NextResponse.next();
      }
    }

    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Dashboard"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
