"use client"

import { useState } from "react"
import { X, Plus, Tag } from "lucide-react"
import { mockTags, getTagById } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  className?: string
}

export function TagInput({ value, onChange, className }: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newTag, setNewTag] = useState("")

  const availableTags = mockTags.filter(tag => !value.includes(tag.id))

  const addTag = (tagId: string) => {
    onChange([...value, tagId])
    setIsOpen(false)
  }

  const removeTag = (tagId: string) => {
    onChange(value.filter(t => t !== tagId))
  }

  const createTag = () => {
    if (!newTag.trim()) return
    const tagId = newTag.toLowerCase().replace(/\s+/g, "-")
    if (!value.includes(tagId)) {
      onChange([...value, tagId])
    }
    setNewTag("")
    setIsOpen(false)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map(tagId => {
            const tag = getTagById(tagId)
            return (
              <span
                key={tagId}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                style={{ 
                  backgroundColor: tag ? `${tag.cor}20` : "var(--surface-hover)",
                  color: tag?.cor || "var(--foreground)"
                }}
              >
                <Tag className="h-3 w-3" />
                {tag?.label || tagId}
                <button
                  type="button"
                  onClick={() => removeTag(tagId)}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Add tag button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]/50 transition-all hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
        >
          <Plus className="h-4 w-4" />
          Adicionar tag
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] py-1 shadow-xl">
              {/* Available tags */}
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <span 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: tag.cor }}
                  />
                  <span>{tag.label}</span>
                </button>
              ))}

              {/* Create new tag */}
              <div className="border-t border-[var(--border)] px-3 py-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nova tag..."
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-2 py-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        createTag()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={createTag}
                    className="rounded-lg bg-[var(--primary)] px-3 py-1 text-xs font-medium text-[var(--primary-foreground)]"
                  >
                    Criar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
