import { Routes, Route } from 'react-router-dom';
// Proteções removidas - AdminApp já está protegido pelo App.tsx

// Import all existing admin pages
import Index from "@/pages/Index";

// Diagnóstico
import DiagnosticoPermissoes from "@/pages/DiagnosticoPermissoes";

// Gabinete
import GabineteAtendimentos from "@/pages/gabinete/Atendimentos";
import GabineteGerenciarAlertas from "@/pages/gabinete/GerenciarAlertas";
import GabineteMapaDemandas from "@/pages/gabinete/MapaDemandas";
import GabineteRelatoriosExecutivos from "@/pages/gabinete/RelatoriosExecutivos";
import GabineteOrdensSetores from "@/pages/gabinete/OrdensSetores";
import GabineteGerenciarPermissoes from "@/pages/gabinete/GerenciarPermissoes";
import GabineteProjetosEstrategicos from "@/pages/gabinete/ProjetosEstrategicos";
import GabineteAgendaExecutiva from "@/pages/gabinete/AgendaExecutiva";
import GabineteMonitoramentoKPIs from "@/pages/gabinete/MonitoramentoKPIs";
import GabineteComunitcacaoOficial from "@/pages/gabinete/ComunicacaoOficial";
import GabineteAuditoriaTransparencia from "@/pages/gabinete/AuditoriaTransparencia";
import GabineteConfiguracoesSistema from "@/pages/gabinete/ConfiguracoesSistema";
import GabineteCorneioInterno from "@/pages/gabinete/CorreioInterno";
import GabineteNovoDashboard from "@/pages/gabinete/DashboardGabinete";

// Correio
import CorreioCaixaEntrada from "@/pages/correio/CaixaEntrada";
import CorreioCaixaSaida from "@/pages/correio/CaixaSaida";
import CorreioNovoEmail from "@/pages/correio/NovoEmail";
import CorreioRascunhos from "@/pages/correio/Rascunhos";
import CorreioLixeira from "@/pages/correio/Lixeira";
import CorreioBibliotecaModelos from "@/pages/correio/BibliotecaModelos";
import CorreioAssinaturasDigitais from "@/pages/correio/AssinaturasDigitais";

// Administração
import AdministracaoGerenciamentoUsuarios from "@/pages/administracao/GerenciamentoUsuarios";
import AdministracaoPerfisPermissoes from "@/pages/administracao/PerfisPermissoes";
import AdministracaoSetoresGrupos from "@/pages/administracao/SetoresGrupos";
import AdministracaoConfiguracoesGerais from "@/pages/administracao/ConfiguracoesGerais";
import AdministracaoAuditoriaAcessos from "@/pages/administracao/AuditoriaAcessos";

// Relatórios
import RelatoriosRelatorios from "@/pages/relatorios/Relatorios";
import RelatoriosIndicadoresAtendimentos from "@/pages/relatorios/IndicadoresAtendimentos";
import RelatoriosEstatisticasUso from "@/pages/relatorios/EstatisticasUso";
import RelatoriosExportacoes from "@/pages/relatorios/Exportacoes";

// Configurações
import ConfiguracoesMeuPerfil from "@/pages/configuracoes/MeuPerfil";
import ConfiguracoesTrocarSenha from "@/pages/configuracoes/TrocarSenha";
import ConfiguracoesPreferenciasNotificacao from "@/pages/configuracoes/PreferenciasNotificacao";
import ConfiguracoesIdiomaAcessibilidade from "@/pages/configuracoes/IdiomaAcessibilidade";

// Saúde
import DashboardSaude from "@/pages/saude/DashboardSaude";
import SaudeAtendimentos from "@/pages/saude/Atendimentos";
import SaudeAgendamentosMedicos from "@/pages/saude/AgendamentosMedicos";
import SaudeControleMedicamentos from "@/pages/saude/ControleMedicamentos";
import SaudeCampanhasSaude from "@/pages/saude/CampanhasSaude";
import SaudeProgramasSaude from "@/pages/saude/ProgramasSaude";
import SaudeEncaminhamentosTFD from "@/pages/saude/EncaminhamentosTFD";
import SaudeExames from "@/pages/saude/Exames";
import SaudeACS from "@/pages/saude/ACS";
import SaudeTransportePacientes from "@/pages/saude/TransportePacientes";

// Educação
import DashboardEducacao from "@/pages/educacao/DashboardEducacao";
import EducacaoAtendimentos from "@/pages/educacao/Atendimentos";
import EducacaoMatriculaAlunos from "@/pages/educacao/MatriculaAlunos";
import EducacaoGestaoEscolar from "@/pages/educacao/GestaoEscolar";
import EducacaoTransporteEscolar from "@/pages/educacao/TransporteEscolar";
import EducacaoMerendaEscolar from "@/pages/educacao/MerendaEscolar";
import EducacaoRegistroOcorrencias from "@/pages/educacao/RegistroOcorrencias";
import EducacaoCalendarioEscolar from "@/pages/educacao/CalendarioEscolar";

// Assistência Social
import DashboardAssistenciaSocial from "@/pages/assistencia-social/DashboardAssistenciaSocial";
import AssistenciaSocialAtendimentos from "@/pages/assistencia-social/Atendimentos";
import AssistenciaSocialFamiliasVulneraveis from "@/pages/assistencia-social/FamiliasVulneraveis";
import AssistenciaSocialCrasECreas from "@/pages/assistencia-social/CrasECreas";
import AssistenciaSocialProgramasSociais from "@/pages/assistencia-social/ProgramasSociais";
import AssistenciaSocialGerenciamentoBeneficios from "@/pages/assistencia-social/GerenciamentoBeneficios";
import AssistenciaSocialEntregasEmergenciais from "@/pages/assistencia-social/EntregasEmergenciais";
import AssistenciaSocialRegistroVisitas from "@/pages/assistencia-social/RegistroVisitas";

// Cultura
import DashboardCultura from "@/pages/cultura/DashboardCultura";
import CulturaAtendimentos from "@/pages/cultura/Atendimentos";
import CulturaEspacosCulturais from "@/pages/cultura/EspacosCulturais";
import CulturaProjetosCulturais from "@/pages/cultura/ProjetosCulturais";
import CulturaEventos from "@/pages/cultura/Eventos";
import CulturaGruposArtisticos from "@/pages/cultura/GruposArtisticos";
import CulturaManifestacoesCulturais from "@/pages/cultura/ManifestacoesCulturais";
import CulturaOficinasCursos from "@/pages/cultura/OficinasCursos";

// Agricultura
import DashboardAgricultura from "@/pages/agricultura/DashboardAgricultura";
import AgriculturaAtendimentos from "@/pages/agricultura/Atendimentos";
import AgriculturaCadastroProdutores from "@/pages/agricultura/CadastroProdutores";
import AgriculturaAssistenciaTecnica from "@/pages/agricultura/AssistenciaTecnica";
import AgriculturaProgramasRurais from "@/pages/agricultura/ProgramasRurais";
import AgriculturaCursosCapacitacoes from "@/pages/agricultura/CursosCapacitacoes";

// Esportes
import DashboardEsportes from "@/pages/esportes/DashboardEsportes";
import EsportesAtendimentos from "@/pages/esportes/Atendimentos";
import EsportesEquipesEsportivas from "@/pages/esportes/EquipesEsportivas";
import EsportesCompeticoesTorneios from "@/pages/esportes/CompeticoesTorneios";
import EsportesAtletasFederados from "@/pages/esportes/AtletasFederados";
import EsportesEscolinhasEsportivas from "@/pages/esportes/EscolinhasEsportivas";
import EsportesEventosEsportivos from "@/pages/esportes/EventosEsportivos";
import EsportesInfraestruturaEsportiva from "@/pages/esportes/InfraestruturaEsportiva";

// Turismo
import DashboardTurismo from "@/pages/turismo/DashboardTurismo";
import TurismoAtendimentos from "@/pages/turismo/Atendimentos";
import TurismoPontosTuristicos from "@/pages/turismo/PontosTuristicos";
import TurismoEstabelecimentosLocais from "@/pages/turismo/EstabelecimentosLocais";
import TurismoProgramasTuristicos from "@/pages/turismo/ProgramasTuristicos";
import TurismoMapaTuristico from "@/pages/turismo/MapaTuristico";
import TurismoInformacoesTuristicas from "@/pages/turismo/InformacoesTuristicas";

// Habitação
import DashboardHabitacao from "@/pages/habitacao/DashboardHabitacao";
import HabitacaoAtendimentos from "@/pages/habitacao/Atendimentos";
import HabitacaoInscricoes from "@/pages/habitacao/Inscricoes";
import HabitacaoProgramasHabitacionais from "@/pages/habitacao/ProgramasHabitacionais";
import HabitacaoUnidadesHabitacionais from "@/pages/habitacao/UnidadesHabitacionais";
import HabitacaoRegularizacaoFundiaria from "@/pages/habitacao/RegularizacaoFundiaria";

// Meio Ambiente
import DashboardMeioAmbiente from "@/pages/meio-ambiente/DashboardMeioAmbiente";
import MeioAmbienteAtendimentos from "@/pages/meio-ambiente/Atendimentos";
import MeioAmbienteLicencasAmbientais from "@/pages/meio-ambiente/LicencasAmbientais";
import MeioAmbienteRegistroDenuncias from "@/pages/meio-ambiente/RegistroDenuncias";
import MeioAmbienteAreasProtegidas from "@/pages/meio-ambiente/AreasProtegidas";
import MeioAmbienteProgramasAmbientais from "@/pages/meio-ambiente/ProgramasAmbientais";

// Planejamento Urbano
import DashboardPlanejamento from "@/pages/planejamento-urbano/DashboardPlanejamento";
import PlanejamentoUrbanoAtendimentos from "@/pages/planejamento-urbano/Atendimentos";
import AprovacaoProjetos from "@/pages/planejamento-urbano/AprovacaoProjetos";
import EmissaoAlvaras from "@/pages/planejamento-urbano/EmissaoAlvaras";
import ReclamacoesDenuncias from "@/pages/planejamento-urbano/ReclamacoesDenuncias";
import ConsultasPublicas from "@/pages/planejamento-urbano/ConsultasPublicas";
import MapaUrbano from "@/pages/planejamento-urbano/MapaUrbano";

// Obras Públicas
import ObrasPublicasAtendimentos from "@/pages/obras-publicas/Atendimentos";
import ObrasIntervencoes from "@/pages/obras-publicas/ObrasIntervencoes";
import ProgressoObras from "@/pages/obras-publicas/ProgressoObras";
import MapaObras from "@/pages/obras-publicas/MapaObras";

// Serviços Públicos
import DashboardServicosPublicos from "@/pages/servicos-publicos/DashboardServicosPublicos";
import ServicosPublicosAtendimentos from "@/pages/servicos-publicos/Atendimentos";
import IluminacaoPublica from "@/pages/servicos-publicos/IluminacaoPublica";
import LimpezaUrbana from "@/pages/servicos-publicos/LimpezaUrbana";
import ColetaEspecial from "@/pages/servicos-publicos/ColetaEspecial";
import ProblemasComFoto from "@/pages/servicos-publicos/ProblemasComFoto";
import ProgramacaoEquipes from "@/pages/servicos-publicos/ProgramacaoEquipes";

// Segurança Pública
import DashboardSeguranca from "@/pages/seguranca-publica/DashboardSeguranca";
import SegurancaPublicaAtendimentos from "@/pages/seguranca-publica/Atendimentos";
import RegistroOcorrencias from "@/pages/seguranca-publica/RegistroOcorrencias";
import ApoioGuarda from "@/pages/seguranca-publica/ApoioGuarda";
import MapaPontosCriticos from "@/pages/seguranca-publica/MapaPontosCriticos";
import AlertasSeguranca from "@/pages/seguranca-publica/AlertasSeguranca";
import EstatisticasRegionais from "@/pages/seguranca-publica/EstatisticasRegionais";
import VigilanciaIntegrada from "@/pages/seguranca-publica/VigilanciaIntegrada";

// Auth pages
import AdminLogin from "@/pages/admin/auth/AdminLogin";
import RegisterServer from "@/pages/auth/RegisterServer";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

// Diagnostic pages
import SupabaseDiagnosticsPage from "@/pages/SupabaseDiagnostics";

function AdminApp() {
  return (
    <Routes>
      {/* Authentication routes */}
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/register/server" element={<RegisterServer />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Admin panel - main pages */}
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Index />} />

      {/* Gabinete */}
      <Route path="/gabinete/dashboard" element={<GabineteNovoDashboard />} />
      <Route path="/gabinete/atendimentos" element={<GabineteAtendimentos />} />
      <Route path="/gabinete/gerenciar-alertas" element={<GabineteGerenciarAlertas />} />
      <Route path="/gabinete/ordens-setores" element={<GabineteOrdensSetores />} />
      <Route path="/gabinete/mapa-demandas" element={<GabineteMapaDemandas />} />
      <Route path="/gabinete/projetos-estrategicos" element={<GabineteProjetosEstrategicos />} />
      <Route path="/gabinete/agenda-executiva" element={<GabineteAgendaExecutiva />} />
      <Route path="/gabinete/relatorios-executivos" element={<GabineteRelatoriosExecutivos />} />
      <Route path="/gabinete/monitoramento-kpis" element={<GabineteMonitoramentoKPIs />} />
      <Route path="/gabinete/comunicacao-oficial" element={<GabineteComunitcacaoOficial />} />
      <Route path="/gabinete/auditoria-transparencia" element={<GabineteAuditoriaTransparencia />} />
      <Route path="/gabinete/gerenciar-permissoes" element={<GabineteGerenciarPermissoes />} />
      <Route path="/gabinete/configuracoes-sistema" element={<GabineteConfiguracoesSistema />} />
      <Route path="/gabinete/correio-interno" element={<GabineteCorneioInterno />} />

      {/* Correio */}
      <Route path="/correio/caixa-entrada" element={<CorreioCaixaEntrada />} />
      <Route path="/correio/caixa-saida" element={<CorreioCaixaSaida />} />
      <Route path="/correio/novo-email" element={<CorreioNovoEmail />} />
      <Route path="/correio/rascunhos" element={<CorreioRascunhos />} />
      <Route path="/correio/lixeira" element={<CorreioLixeira />} />
      <Route path="/correio/biblioteca-modelos" element={<CorreioBibliotecaModelos />} />
      <Route path="/correio/assinaturas-digitais" element={<CorreioAssinaturasDigitais />} />

      {/* Administração */}
      <Route path="/administracao/gerenciamento-usuarios" element={<AdministracaoGerenciamentoUsuarios />} />
      <Route path="/administracao/perfis-permissoes" element={<AdministracaoPerfisPermissoes />} />
      <Route path="/administracao/setores-grupos" element={<AdministracaoSetoresGrupos />} />
      <Route path="/administracao/configuracoes-gerais" element={<AdministracaoConfiguracoesGerais />} />
      <Route path="/administracao/auditoria-acessos" element={<AdministracaoAuditoriaAcessos />} />

      {/* Relatórios */}
      <Route path="/relatorios/relatorios" element={<RelatoriosRelatorios />} />
      <Route path="/relatorios/indicadores-atendimentos" element={<RelatoriosIndicadoresAtendimentos />} />
      <Route path="/relatorios/estatisticas-uso" element={<RelatoriosEstatisticasUso />} />
      <Route path="/relatorios/exportacoes" element={<RelatoriosExportacoes />} />

      {/* Configurações */}
      <Route path="/configuracoes/meu-perfil" element={<ConfiguracoesMeuPerfil />} />
      <Route path="/configuracoes/trocar-senha" element={<ConfiguracoesTrocarSenha />} />
      <Route path="/configuracoes/preferencias-notificacao" element={<ConfiguracoesPreferenciasNotificacao />} />
      <Route path="/configuracoes/idioma-acessibilidade" element={<ConfiguracoesIdiomaAcessibilidade />} />

      {/* Saúde */}
      <Route path="/saude/dashboard" element={<DashboardSaude />} />
      <Route path="/saude/atendimentos" element={<SaudeAtendimentos />} />
      <Route path="/saude/agendamentos-medicos" element={<SaudeAgendamentosMedicos />} />
      <Route path="/saude/controle-medicamentos" element={<SaudeControleMedicamentos />} />
      <Route path="/saude/campanhas-saude" element={<SaudeCampanhasSaude />} />
      <Route path="/saude/programas-saude" element={<SaudeProgramasSaude />} />
      <Route path="/saude/encaminhamentos-tfd" element={<SaudeEncaminhamentosTFD />} />
      <Route path="/saude/exames" element={<SaudeExames />} />
      <Route path="/saude/acs" element={<SaudeACS />} />
      <Route path="/saude/transporte-pacientes" element={<SaudeTransportePacientes />} />

      {/* Educação */}
      <Route path="/educacao/dashboard" element={<DashboardEducacao />} />
      <Route path="/educacao/atendimentos" element={<EducacaoAtendimentos />} />
      <Route path="/educacao/matricula-alunos" element={<EducacaoMatriculaAlunos />} />
      <Route path="/educacao/gestao-escolar" element={<EducacaoGestaoEscolar />} />
      <Route path="/educacao/transporte-escolar" element={<EducacaoTransporteEscolar />} />
      <Route path="/educacao/merenda-escolar" element={<EducacaoMerendaEscolar />} />
      <Route path="/educacao/registro-ocorrencias" element={<EducacaoRegistroOcorrencias />} />
      <Route path="/educacao/calendario-escolar" element={<EducacaoCalendarioEscolar />} />

      {/* Assistência Social */}
      <Route path="/assistencia-social/dashboard" element={<DashboardAssistenciaSocial />} />
      <Route path="/assistencia-social/atendimentos" element={<AssistenciaSocialAtendimentos />} />
      <Route path="/assistencia-social/familias-vulneraveis" element={<AssistenciaSocialFamiliasVulneraveis />} />
      <Route path="/assistencia-social/cras-e-creas" element={<AssistenciaSocialCrasECreas />} />
      <Route path="/assistencia-social/programas-sociais" element={<AssistenciaSocialProgramasSociais />} />
      <Route path="/assistencia-social/gerenciamento-beneficios" element={<AssistenciaSocialGerenciamentoBeneficios />} />
      <Route path="/assistencia-social/entregas-emergenciais" element={<AssistenciaSocialEntregasEmergenciais />} />
      <Route path="/assistencia-social/registro-visitas" element={<AssistenciaSocialRegistroVisitas />} />

      {/* Cultura */}
      <Route path="/cultura/dashboard" element={<DashboardCultura />} />
      <Route path="/cultura/atendimentos" element={<CulturaAtendimentos />} />
      <Route path="/cultura/espacos-culturais" element={<CulturaEspacosCulturais />} />
      <Route path="/cultura/projetos-culturais" element={<CulturaProjetosCulturais />} />
      <Route path="/cultura/eventos" element={<CulturaEventos />} />
      <Route path="/cultura/grupos-artisticos" element={<CulturaGruposArtisticos />} />
      <Route path="/cultura/manifestacoes-culturais" element={<CulturaManifestacoesCulturais />} />
      <Route path="/cultura/oficinas-cursos" element={<CulturaOficinasCursos />} />

      {/* Agricultura */}
      <Route path="/agricultura/dashboard" element={<DashboardAgricultura />} />
      <Route path="/agricultura/atendimentos" element={<AgriculturaAtendimentos />} />
      <Route path="/agricultura/cadastro-produtores" element={<AgriculturaCadastroProdutores />} />
      <Route path="/agricultura/assistencia-tecnica" element={<AgriculturaAssistenciaTecnica />} />
      <Route path="/agricultura/programas-rurais" element={<AgriculturaProgramasRurais />} />
      <Route path="/agricultura/cursos-capacitacoes" element={<AgriculturaCursosCapacitacoes />} />

      {/* Esportes */}
      <Route path="/esportes/dashboard" element={<DashboardEsportes />} />
      <Route path="/esportes/atendimentos" element={<EsportesAtendimentos />} />
      <Route path="/esportes/equipes-esportivas" element={<EsportesEquipesEsportivas />} />
      <Route path="/esportes/competicoes-torneios" element={<EsportesCompeticoesTorneios />} />
      <Route path="/esportes/atletas-federados" element={<EsportesAtletasFederados />} />
      <Route path="/esportes/escolinhas-esportivas" element={<EsportesEscolinhasEsportivas />} />
      <Route path="/esportes/eventos-esportivos" element={<EsportesEventosEsportivos />} />
      <Route path="/esportes/infraestrutura-esportiva" element={<EsportesInfraestruturaEsportiva />} />

      {/* Turismo */}
      <Route path="/turismo/dashboard" element={<DashboardTurismo />} />
      <Route path="/turismo/atendimentos" element={<TurismoAtendimentos />} />
      <Route path="/turismo/pontos-turisticos" element={<TurismoPontosTuristicos />} />
      <Route path="/turismo/estabelecimentos-locais" element={<TurismoEstabelecimentosLocais />} />
      <Route path="/turismo/programas-turisticos" element={<TurismoProgramasTuristicos />} />
      <Route path="/turismo/mapa-turistico" element={<TurismoMapaTuristico />} />
      <Route path="/turismo/informacoes-turisticas" element={<TurismoInformacoesTuristicas />} />

      {/* Habitação */}
      <Route path="/habitacao/dashboard" element={<DashboardHabitacao />} />
      <Route path="/habitacao/atendimentos" element={<HabitacaoAtendimentos />} />
      <Route path="/habitacao/inscricoes" element={<HabitacaoInscricoes />} />
      <Route path="/habitacao/programas-habitacionais" element={<HabitacaoProgramasHabitacionais />} />
      <Route path="/habitacao/unidades-habitacionais" element={<HabitacaoUnidadesHabitacionais />} />
      <Route path="/habitacao/regularizacao-fundiaria" element={<HabitacaoRegularizacaoFundiaria />} />

      {/* Meio Ambiente */}
      <Route path="/meio-ambiente/dashboard" element={<DashboardMeioAmbiente />} />
      <Route path="/meio-ambiente/atendimentos" element={<MeioAmbienteAtendimentos />} />
      <Route path="/meio-ambiente/licencas-ambientais" element={<MeioAmbienteLicencasAmbientais />} />
      <Route path="/meio-ambiente/registro-denuncias" element={<MeioAmbienteRegistroDenuncias />} />
      <Route path="/meio-ambiente/areas-protegidas" element={<MeioAmbienteAreasProtegidas />} />
      <Route path="/meio-ambiente/programas-ambientais" element={<MeioAmbienteProgramasAmbientais />} />

      {/* Planejamento Urbano */}
      <Route path="/planejamento-urbano/dashboard" element={<DashboardPlanejamento />} />
      <Route path="/planejamento-urbano/atendimentos" element={<PlanejamentoUrbanoAtendimentos />} />
      <Route path="/planejamento-urbano/aprovacao-projetos" element={<AprovacaoProjetos />} />
      <Route path="/planejamento-urbano/emissao-alvaras" element={<EmissaoAlvaras />} />
      <Route path="/planejamento-urbano/reclamacoes-denuncias" element={<ReclamacoesDenuncias />} />
      <Route path="/planejamento-urbano/consultas-publicas" element={<ConsultasPublicas />} />
      <Route path="/planejamento-urbano/mapa-urbano" element={<MapaUrbano />} />

      {/* Obras Públicas */}
      <Route path="/obras-publicas/atendimentos" element={<ObrasPublicasAtendimentos />} />
      <Route path="/obras-publicas/obras-intervencoes" element={<ObrasIntervencoes />} />
      <Route path="/obras-publicas/progresso-obras" element={<ProgressoObras />} />
      <Route path="/obras-publicas/mapa-obras" element={<MapaObras />} />
      
      {/* Serviços Públicos */}
      <Route path="/servicos-publicos/dashboard" element={<DashboardServicosPublicos />} />
      <Route path="/servicos-publicos/atendimentos" element={<ServicosPublicosAtendimentos />} />
      <Route path="/servicos-publicos/iluminacao-publica" element={<IluminacaoPublica />} />
      <Route path="/servicos-publicos/limpeza-urbana" element={<LimpezaUrbana />} />
      <Route path="/servicos-publicos/coleta-especial" element={<ColetaEspecial />} />
      <Route path="/servicos-publicos/problemas-com-foto" element={<ProblemasComFoto />} />
      <Route path="/servicos-publicos/programacao-equipes" element={<ProgramacaoEquipes />} />
      
      {/* Segurança Pública */}
      <Route path="/seguranca-publica/dashboard" element={<DashboardSeguranca />} />
      <Route path="/seguranca-publica/atendimentos" element={<SegurancaPublicaAtendimentos />} />
      <Route path="/seguranca-publica/registro-ocorrencias" element={<RegistroOcorrencias />} />
      <Route path="/seguranca-publica/apoio-guarda" element={<ApoioGuarda />} />
      <Route path="/seguranca-publica/mapa-pontos-criticos" element={<MapaPontosCriticos />} />
      <Route path="/seguranca-publica/alertas-seguranca" element={<AlertasSeguranca />} />
      <Route path="/seguranca-publica/estatisticas-regionais" element={<EstatisticasRegionais />} />
      <Route path="/seguranca-publica/vigilancia-integrada" element={<VigilanciaIntegrada />} />

      {/* Diagnóstico do Sistema */}
      <Route path="/diagnostics/supabase" element={<SupabaseDiagnosticsPage />} />
      <Route path="/diagnostics/permissoes" element={<DiagnosticoPermissoes />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AdminApp;