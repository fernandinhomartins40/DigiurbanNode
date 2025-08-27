import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const DialogMedium = DialogPrimitive.Root

const DialogMediumTrigger = DialogPrimitive.Trigger

const DialogMediumPortal = DialogPrimitive.Portal

const DialogMediumClose = DialogPrimitive.Close

const DialogMediumOverlay = React.forwardRef<
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
DialogMediumOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogMediumContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogMediumPortal>
    <DialogMediumOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Posicionamento centralizado com margens seguras
        "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
        // Dimensões responsivas para modais médios
        "w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-4xl",
        "h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] max-h-[85vh] sm:max-h-[80vh]",
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
  </DialogMediumPortal>
))
DialogMediumContent.displayName = DialogPrimitive.Content.displayName

const DialogMediumHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Layout fixo para o header com responsividade
      "flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3",
      // Separação visual
      "border-b border-border/50",
      // Estilo responsivo
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogMediumHeader.displayName = "DialogMediumHeader"

const DialogMediumBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Área que cresce e tem scroll interno com responsividade
      "flex-1 overflow-y-auto px-4 sm:px-6 py-4",
      // Customização da scrollbar para combinar com bordas arredondadas
      "scrollbar-modal",
      // Garantir que o scroll não vaze para fora do modal
      "scroll-smooth",
      className
    )}
    {...props}
  />
)
DialogMediumBody.displayName = "DialogMediumBody"

const DialogMediumFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Layout fixo para o footer com responsividade
      "flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4",
      // Separação visual
      "border-t border-border/50 bg-muted/50",
      // Estilo responsivo
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0",
      className
    )}
    {...props}
  />
)
DialogMediumFooter.displayName = "DialogMediumFooter"

const DialogMediumTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogMediumTitle.displayName = DialogPrimitive.Title.displayName

const DialogMediumDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-2", className)}
    {...props}
  />
))
DialogMediumDescription.displayName = DialogPrimitive.Description.displayName

export {
  DialogMedium,
  DialogMediumPortal,
  DialogMediumOverlay,
  DialogMediumClose,
  DialogMediumTrigger,
  DialogMediumContent,
  DialogMediumHeader,
  DialogMediumBody,
  DialogMediumFooter,
  DialogMediumTitle,
  DialogMediumDescription,
}