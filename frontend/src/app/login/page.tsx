"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  User,
  Shield
} from "lucide-react";

const TEAM_MEMBERS = [
  { id: "lucas", name: "Lucas Drummond", email: "lucas.drummondpv@gmail.com", role: "Admin" },
  { id: "ana", name: "Ana Paula", email: "ana@edicula.com.br", role: "Gestão" },
  { id: "marcos", name: "Marcos Silva", email: "marcos@edicula.com.br", role: "Desenvolvimento" },
  { id: "joao", name: "João Santos", email: "joao@edicula.com.br", role: "Design" },
];

function TeamSelector() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectMember = async (member: typeof TEAM_MEMBERS[0]) => {
    setLoading(member.id);
    
    // Simular seleção
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Salvar usuário selecionado no localStorage
    localStorage.setItem("edicula_user", JSON.stringify(member));
    
    // Redirecionar
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">EdiculaWorks</h1>
          <p className="text-gray-400">Sistema interno de gestão</p>
        </div>
        
        {/* Card de Seleção */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Quem está usando?</h2>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            Selecione seu perfil para acessar o sistema
          </p>
          
          {/* Lista de Membros */}
          <div className="space-y-3">
            {TEAM_MEMBERS.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelectMember(member)}
                disabled={!!loading}
                className="w-full flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-gray-700 hover:border-blue-500 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-gray-400 text-sm">{member.role}</p>
                </div>
                {loading === member.id && (
                  <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                )}
              </button>
            ))}
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
  return <TeamSelector />;
}
