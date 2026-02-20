"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Mail, 
  Lock, 
  Github, 
  Chrome,
  AlertCircle 
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const result = await signIn.email({
        email,
        password,
      });
      
      if (result.error) {
        setError(result.error.message || "Erro ao fazer login");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleOAuthLogin = async (provider: "google" | "github") => {
    setError("");
    setOauthLoading(provider);
    
    try {
      await signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
    } catch (err) {
      setError(`Erro ao fazer login com ${provider}`);
      setOauthLoading(null);
    }
  };

  const hasGoogleOAuth = !!process.env.NEXT_PUBLIC_HAS_GOOGLE_OAUTH;
  const hasGitHubOAuth = !!process.env.NEXT_PUBLIC_HAS_GITHUB_OAUTH;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">EdiculaWorks</h1>
          <p className="text-gray-400">Sistema interno de gestão</p>
        </div>
        
        {/* Card de Login */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-6">Entrar</h2>
          
          {/* Erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Formulário Email/Password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          {/* Separador - só mostrar se tiver OAuth configurado */}
          {(hasGoogleOAuth || hasGitHubOAuth) && (
            <div className="relative my-6">
              <Separator className="bg-gray-700" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-2 text-xs text-gray-500">
                ou continue com
              </span>
            </div>
          )}
          
          {/* OAuth Buttons */}
          <div className="space-y-3">
            {hasGoogleOAuth && (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-gray-900/50 border-gray-700 text-white hover:bg-gray-700"
                onClick={() => handleOAuthLogin("google")}
                disabled={!!oauthLoading}
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
            )}
            
            {hasGitHubOAuth && (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-gray-900/50 border-gray-700 text-white hover:bg-gray-700"
                onClick={() => handleOAuthLogin("github")}
                disabled={!!oauthLoading}
              >
                {oauthLoading === "github" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          EdiculaWorks © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
