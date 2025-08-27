import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'

export function UserMenu() {
  const { profile: user, logout: signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logout realizado com sucesso!')
      // Force page refresh to ensure clean state
      window.location.href = '/'
    } catch (error) {
      console.error('Erro no logout:', error)
      toast.error('Erro ao fazer logout')
      // Even if error, try to redirect
      window.location.href = '/'
    }
  }

  const getDisplayName = () => {
    if (!user) return ''
    return user.name || user.email || 'Usuário'
  }

  const getUserTypeLabel = () => {
    if (!user || !user.role) return ''
    const typeMap: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Administrador',
      'user': 'Usuário',
      'guest': 'Visitante'
    }
    return typeMap[user.role] || user.role.toUpperCase()
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start h-auto p-3">
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium truncate w-full">{getDisplayName()}</span>
              <span className="text-xs text-muted-foreground">{getUserTypeLabel()}</span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {getUserTypeLabel()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}