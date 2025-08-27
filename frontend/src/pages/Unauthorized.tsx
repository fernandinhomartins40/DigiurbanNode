import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white dark:bg-gray-800 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Você não tem permissão para acessar esta página
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Entre em contato com o administrador do sistema para solicitar as permissões necessárias.</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link to="/admin">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="javascript:history.back()">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}