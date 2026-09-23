"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Trash2, X } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  itemName?: string
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-red-500/20">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-display text-red-500">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
            {itemName && <span className="block mt-2 font-medium text-foreground">&quot;{itemName}&quot;</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button variant="destructive" onClick={handleConfirm} className="flex-1">
            <Trash2 className="w-4 h-4 mr-2" />
            Evet, Sil
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 border-primary/20 bg-transparent">
            <X className="w-4 h-4 mr-2" />
            İptal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
