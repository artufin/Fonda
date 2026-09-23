import { NextResponse, type NextRequest } from "next/server";

const GUEST_COOKIE = "fonda_guest";

// Todo requiere sesión (nombre) salvo la pantalla de ingreso y el admin.
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasGuest = Boolean(request.cookies.get(GUEST_COOKIE)?.value);

  if (!hasGuest) {
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    url.search = "";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Excluye /ingresar, /admin, assets de Next y archivos estáticos.
    "/((?!ingresar|admin|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
