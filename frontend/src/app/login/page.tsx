"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
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
  AlertCircle,
  UserPlus
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  
  const parseError = (err: unknown): { message: string; detail: string } => {
    const errorStr = err instanceof Error ? err.message : String(err);
    const errorCode = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : '';
    const errorResponse = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response?.data : null;
    
    console.log("DEBUG - Erro completo:", err);
    console.log("DEBUG - Error str:", errorStr);
    console.log("DEBUG - Error code:", errorCode);
    console.log("DEBUG - Error response:", errorResponse);
    
    // Erros de banco de dados
    if (errorStr.includes("relation") || errorStr.includes("table") || errorStr.includes("database") || errorStr.includes("42P01") || errorStr.includes("42P02")) {
      return { 
        message: "Erro: Tabelas do banco de dados não existem.", 
        detail: `DB Error: ${errorStr.substring(0, 200)}` 
      };
    }
    
    // Erros de credenciais
    if (errorStr.includes("user not found") || errorStr.includes("invalid credentials") || errorStr.includes("incorrect") || errorStr.includes("password")) {
      return { 
        message: "Email ou senha incorretos.", 
        detail: `Credenciais inválidas para: ${email}` 
      };
    }
    
    // Erros de rede
    if (errorStr.includes("network") || errorStr.includes("fetch") || errorStr.includes("ECONNREFUSED") || errorStr.includes("ENOTFOUND")) {
      return { 
        message: "Erro de conexão. Verifique sua internet.", 
        detail: `Network Error: ${errorStr.substring(0, 200)}` 
      };
    }
    
    // Erros de servidor
    if (errorStr.includes("500") || errorStr.includes("502") || errorStr.includes("503") || errorStr.includes("server error")) {
      return { 
        message: "Erro no servidor. Tente novamente mais tarde.", 
        detail: `Server Error: ${errorStr.substring(0, 200)}` 
      };
    }
    
    // Erros de autorização
    if (errorStr.includes("unauthorized") || errorStr.includes("403") || errorStr.includes("forbidden")) {
      return { 
        message: "Acesso não autorizado.", 
        detail: `Auth Error: ${errorStr.substring(0, 200)}` 
      };
    }
    
    // Erro genérico
    return { 
      message: "Erro ao fazer login. Tente novamente.", 
      detail: `Error: ${errorStr.substring(0, 300)}` 
    };
  };
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorDetail("");
    setLoading(true);
    
    // Validação básica
    if (!email || !email.includes("@")) {
      setError("Por favor, insira um email válido.");
      setLoading(false);
      return;
    }
    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Tentando login com:", email);
      const result = await signIn.email({
        email,
        password,
      });
      
      if (result.error) {
        console.log("Erro do Better Auth:", result.error);
        const parsed = parseError(result.error);
        setError(parsed.message);
        setErrorDetail(parsed.detail);
      } else {
        console.log("Login bem-sucedido!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Erro catch:", err);
      const parsed = parseError(err);
      setError(parsed.message);
      setErrorDetail(parsed.detail);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorDetail("");
    setSuccess("");
    setLoading(true);
    
    // Validação
    if (!name || name.length < 2) {
      setError("Por favor, insira seu nome.");
      setLoading(false);
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Por favor, insira um email válido.");
      setLoading(false);
      return;
    }
    if (!password || password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Tentando registrar:", email);
      const result = await signUp.email({
        email,
        password,
        name,
      });
      
      if (result.error) {
        console.log("Erro do Better Auth:", result.error);
        const parsed = parseError(result.error);
        setError(parsed.message);
        setErrorDetail(parsed.detail);
      } else {
        console.log("Registro bem-sucedido!");
        setSuccess("Conta criada com sucesso! Você já pode fazer login.");
        setIsRegister(false);
        setEmail("");
        setPassword("");
        setName("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      console.error("Erro catch:", err);
      const parsed = parseError(err);
      setError(parsed.message);
      setErrorDetail(parsed.detail);
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
          
          {/* Erro ou Sucesso */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              {errorDetail && (
                <details className="mt-2">
                  <summary className="text-red-300 text-xs cursor-pointer hover:text-red-200">
                    Ver detalhes técnicos
                  </summary>
                  <pre className="mt-2 p-2 bg-red-900/30 rounded text-xs text-red-300 overflow-x-auto whitespace-pre-wrap">
                    {errorDetail}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}
          
          {/* Formulário Email/Password */}
          <form onSubmit={isRegister ? handleSignUp : handleEmailLogin} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nome</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                    required={isRegister}
                  />
                </div>
              </div>
            )}
            
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
              <Label htmlFor="password" className="text-gray-300">{isRegister ? "Senha" : "Senha"}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isRegister ? "Mínimo 8 caracteres" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  required
                  minLength={isRegister ? 8 : undefined}
                />
              </div>
            </div>
            
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                    required={isRegister}
                  />
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRegister ? "Criando conta..." : "Entrando..."}
                </>
              ) : (
                isRegister ? "Criar Conta" : "Entrar"
              )}
            </Button>
          </form>
          
          {/* Alternar entre Login e Registro */}
          <div className="mt-4 text-center">
            {isRegister ? (
              <p className="text-gray-400 text-sm">
                Já tem conta?{" "}
                <button 
                  type="button"
                  onClick={() => { setIsRegister(false); setError(""); setSuccess(""); }}
                  className="text-blue-400 hover:underline"
                >
                  Faça login
                </button>
              </p>
            ) : (
              <p className="text-gray-400 text-sm">
                Não tem conta?{" "}
                <button 
                  type="button"
                  onClick={() => { setIsRegister(true); setError(""); setSuccess(""); }}
                  className="text-blue-400 hover:underline"
                >
                  Criar conta
                </button>
              </p>
            )}
          </div>

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
