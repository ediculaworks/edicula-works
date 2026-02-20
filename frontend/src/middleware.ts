import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas públicas
const publicRoutes = ["/login"];

// Paths excluídos
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
  
  // Verificar se usuário foi selecionado (via header_CLIENT-side)
  // O cliente define um cookie quando seleciona o membro
  const userCookie = request.cookies.get("edicula_user");
  
  // Para rotas públicas, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Se não tem usuário selecionado, permitir acesso (sem auth)
  // O sistema é aberto - qualquer um pode acessar
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
};
