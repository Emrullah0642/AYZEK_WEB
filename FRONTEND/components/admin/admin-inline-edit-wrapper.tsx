"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface InlineEditWrapperProps {
  children: React.ReactNode
  onEdit?: () => void
  onDelete?: () => void
  onAdd?: () => void
  showAdd?: boolean
  showEdit?: boolean
  showDelete?: boolean
  className?: string
  editLabel?: string
  deleteLabel?: string
  addLabel?: string
}

export function InlineEditWrapper({
  children,
  onEdit,
  onDelete,
  onAdd,
  showAdd = false,
  showEdit = true,
  showDelete = false,
  className = "",
  editLabel = "Düzenle",
  deleteLabel = "Sil",
  addLabel = "Ekle",
}: InlineEditWrapperProps) {
  const { isEditMode } = useAdmin()
  const [isHovered, setIsHovered] = useState(false)

  if (!isEditMode) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Floating Action Buttons */}
      {isHovered && (
        <div className="absolute top-2 right-2 flex gap-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {showEdit && onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onEdit}
              className="h-8 w-8 p-0 bg-primary hover:opacity-90 text-white border-0 shadow-lg"
            >
              <Edit className="w-3 h-3" />
              <span className="sr-only">{editLabel}</span>
            </Button>
          )}
          {showAdd && onAdd && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onAdd}
              className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg"
            >
              <Plus className="w-3 h-3" />
              <span className="sr-only">{addLabel}</span>
            </Button>
          )}
          {showDelete && onDelete && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onDelete}
              className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg"
            >
              <Trash2 className="w-3 h-3" />
              <span className="sr-only">{deleteLabel}</span>
            </Button>
          )}
        </div>
      )}

      {/* Edit Mode Indicator Border */}
      <div className="absolute inset-0 border-2 border-dashed border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg" />
    </div>
  )
}
