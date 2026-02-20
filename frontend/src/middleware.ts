import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas públicas (não exigem autenticação)
const publicRoutes = ["/login"];

// Rotas de API e arquivos estáticos
const excludedPaths = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/icons",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignorar paths excluídos
  if (excludedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Verificar se é rota pública
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Obter sessão do cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionCookie?.value;
  
  // Se não autenticado e rota protegida
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Se autenticado e tentando acessar login
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Redirecionar raiz para dashboard
  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Se não autenticado e na raiz, redirecionar para login
  if (pathname === "/" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
};
