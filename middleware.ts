import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set(name, value)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isHomePage = req.nextUrl.pathname === "/";

  if (!user && !isAuthPage && !isHomePage)
    return NextResponse.redirect(new URL("/auth/login", req.url));
  if (user && isAuthPage)
    return NextResponse.redirect(new URL("/dashboard", req.url));

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
