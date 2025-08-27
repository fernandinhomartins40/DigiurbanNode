import { Routes, Route } from 'react-router-dom';
import { CitizenRoute } from './ProtectedRoute';

// Páginas do cidadão (transferidas do dashboard principal)
import CatalogoServicos from "@/pages/CatalogoServicos";
import SolicitarServico from "@/pages/SolicitarServico";
import MeusProtocolos from "@/pages/MeusProtocolos";
import DocumentosPessoais from "@/pages/DocumentosPessoais";
import MinhasAvaliacoes from "@/pages/MinhasAvaliacoes";

// Auth pages do cidadão
import RegisterCitizen from "@/pages/auth/RegisterCitizen";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

// Dashboard do cidadão
import CidadaoDashboard from "@/pages/cidadao/dashboard/CidadaoDashboard";

// Auth pages do cidadão
import CidadaoLogin from "@/pages/cidadao/auth/CidadaoLogin";

// Configurações
import MeuPerfil from "@/pages/configuracoes/MeuPerfil";
import TrocarSenha from "@/pages/configuracoes/TrocarSenha";
import PreferenciasNotificacao from "@/pages/configuracoes/PreferenciasNotificacao";
import IdiomaAcessibilidade from "@/pages/configuracoes/IdiomaAcessibilidade";

function CidadaoApp() {
  return (
    <Routes>
      {/* Authentication routes */}
      <Route path="/login" element={<CidadaoLogin />} />
      <Route path="/auth/login" element={<CidadaoLogin />} />
      <Route path="/register" element={<RegisterCitizen />} />
      <Route path="/auth/register" element={<RegisterCitizen />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Cidadão dashboard */}
      <Route path="/" element={
        <CitizenRoute>
          <CidadaoDashboard />
        </CitizenRoute>
      } />
      <Route path="/dashboard" element={
        <CitizenRoute>
          <CidadaoDashboard />
        </CitizenRoute>
      } />


      {/* Serviços do cidadão */}
      <Route path="/servicos" element={
        <CitizenRoute>
          <CatalogoServicos />
        </CitizenRoute>
      } />
      <Route path="/catalogo-servicos" element={
        <CitizenRoute>
          <CatalogoServicos />
        </CitizenRoute>
      } />

      <Route path="/solicitar-servico" element={
        <CitizenRoute>
          <SolicitarServico />
        </CitizenRoute>
      } />
      
      <Route path="/protocolos" element={
        <CitizenRoute>
          <MeusProtocolos />
        </CitizenRoute>
      } />
      <Route path="/meus-protocolos" element={
        <CitizenRoute>
          <MeusProtocolos />
        </CitizenRoute>
      } />
      
      <Route path="/documentos" element={
        <CitizenRoute>
          <DocumentosPessoais />
        </CitizenRoute>
      } />
      <Route path="/documentos-pessoais" element={
        <CitizenRoute>
          <DocumentosPessoais />
        </CitizenRoute>
      } />
      
      <Route path="/avaliacoes" element={
        <CitizenRoute>
          <MinhasAvaliacoes />
        </CitizenRoute>
      } />
      <Route path="/minhas-avaliacoes" element={
        <CitizenRoute>
          <MinhasAvaliacoes />
        </CitizenRoute>
      } />

      {/* Configurações */}
      <Route path="/configuracoes/meu-perfil" element={
        <CitizenRoute>
          <MeuPerfil />
        </CitizenRoute>
      } />
      <Route path="/configuracoes/trocar-senha" element={
        <CitizenRoute>
          <TrocarSenha />
        </CitizenRoute>
      } />
      <Route path="/configuracoes/preferencias-notificacao" element={
        <CitizenRoute>
          <PreferenciasNotificacao />
        </CitizenRoute>
      } />
      <Route path="/configuracoes/idioma-acessibilidade" element={
        <CitizenRoute>
          <IdiomaAcessibilidade />
        </CitizenRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default CidadaoApp;