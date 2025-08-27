import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const DialogLarge = DialogPrimitive.Root

const DialogLargeTrigger = DialogPrimitive.Trigger

const DialogLargePortal = DialogPrimitive.Portal

const DialogLargeClose = DialogPrimitive.Close

const DialogLargeOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogLargeOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogLargeContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogLargePortal>
    <DialogLargeOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Posicionamento centralizado com margens seguras
        "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
        // Dimensões responsivas com margens para não estourar a tela
        "w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-7xl",
        "h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] max-h-[95vh] sm:max-h-[90vh]",
        // Layout flexível para controle da rolagem
        "flex flex-col",
        // Estilo base
        "border bg-background shadow-xl duration-200",
        // Bordas arredondadas
        "rounded-xl",
        // Animações
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-2 sm:right-4 top-2 sm:top-4 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50 bg-background/80 backdrop-blur-sm w-8 h-8 flex items-center justify-center">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogLargePortal>
))
DialogLargeContent.displayName = DialogPrimitive.Content.displayName

const DialogLargeHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Layout fixo para o header com responsividade
      "flex-shrink-0 px-3 sm:px-6 pt-4 sm:pt-6 pb-2",
      // Separação visual
      "border-b border-border/50",
      // Estilo responsivo
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogLargeHeader.displayName = "DialogLargeHeader"

const DialogLargeBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Área que cresce e tem scroll interno com responsividade
      "flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4",
      // Customização da scrollbar para combinar com bordas arredondadas
      "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/20 hover:scrollbar-thumb-border/40",
      // Garantir que o scroll não vaze para fora do modal
      "scroll-smooth",
      className
    )}
    {...props}
  />
)
DialogLargeBody.displayName = "DialogLargeBody"

const DialogLargeFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Layout fixo para o footer com responsividade
      "flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4",
      // Separação visual
      "border-t border-border/50 bg-muted/50",
      // Estilo responsivo
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0",
      className
    )}
    {...props}
  />
)
DialogLargeFooter.displayName = "DialogLargeFooter"

const DialogLargeTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogLargeTitle.displayName = DialogPrimitive.Title.displayName

const DialogLargeDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-2", className)}
    {...props}
  />
))
DialogLargeDescription.displayName = DialogPrimitive.Description.displayName

export {
  DialogLarge,
  DialogLargePortal,
  DialogLargeOverlay,
  DialogLargeClose,
  DialogLargeTrigger,
  DialogLargeContent,
  DialogLargeHeader,
  DialogLargeBody,
  DialogLargeFooter,
  DialogLargeTitle,
  DialogLargeDescription,
}