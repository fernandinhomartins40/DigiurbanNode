
// This is just a re-export file to maintain compatibility with shadcn conventions
import { useToast as useToastHook, toast as toastFunction } from "@/hooks/use-toast"

export const useToast = useToastHook
export const toast = toastFunction
