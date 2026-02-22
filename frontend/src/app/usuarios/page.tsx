"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Users, Pencil, Trash2, X } from "lucide-react"
import { api } from "@/lib/api"

const EMPRESA_ID = 1

interface Usuario {
  id: string
  nome: string
  email: string
  avatar_url?: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formNome, setFormNome] = useState("")
  const [formEmail, setFormEmail] = useState("")

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const data = await api.getUsuarios({ empresa_id: EMPRESA_ID })
      setUsuarios(data)
    } catch (err) {
      console.error("Erro ao carregar usuários:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleOpenModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario)
      setFormNome(usuario.nome)
      setFormEmail(usuario.email)
    } else {
      setEditingUsuario(null)
      setFormNome("")
      setFormEmail("")
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUsuario(null)
    setFormNome("")
    setFormEmail("")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingUsuario) {
        await api.updateUsuario(editingUsuario.id, {
          nome: formNome,
          email: formEmail,
        })
      } else {
        await api.createUsuario({
          empresa_id: EMPRESA_ID,
          nome: formNome,
          email: formEmail,
          role: "member",
        })
      }
      await fetchUsuarios()
      handleCloseModal()
    } catch (err) {
      console.error("Erro ao salvar usuário:", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return
    
    try {
      await api.deleteUsuario(id)
      await fetchUsuarios()
    } catch (err) {
      console.error("Erro ao excluir usuário:", err)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-sm text-[var(--foreground)]/60">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Button className="glow-button" onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bento-item p-4">
                <Skeleton className="h-12 w-12 rounded-full mb-3" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-[var(--surface-hover)] flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-[var(--foreground)]/30" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
            <p className="text-sm text-[var(--foreground)]/50 mb-4">
              Comece adicionando usuários ao sistema
            </p>
            <Button className="glow-button" onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Usuário
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="bento-item p-4 hover:border-[var(--border-hover)] transition-colors cursor-pointer group"
                onClick={() => handleOpenModal(usuario)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium text-lg">
                      {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">{usuario.nome}</h3>
                      <p className="text-sm text-[var(--foreground)]/60">{usuario.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1 hover:bg-[var(--surface-hover)] rounded"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenModal(usuario)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-[var(--surface-hover)] rounded text-[var(--error)]"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(usuario.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-backdrop flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">
                    Nome
                  </label>
                  <Input
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Nome do usuário"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="glow-button">
                    Salvar
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
