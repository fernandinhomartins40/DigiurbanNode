
import { FC } from "react";

export const Dashboard: FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Painel do Cidadão
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
              Protocolos Abertos
            </h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900/30 dark:text-blue-400">
              5 ativos
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  #12345 - Solicitação de Poda de Árvore
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Aberto em: 15/05/2023
                </p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded dark:bg-yellow-900/30 dark:text-yellow-400">
                Em análise
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  #12346 - Reparo em Iluminação Pública
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Aberto em: 10/05/2023
                </p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded dark:bg-green-900/30 dark:text-green-400">
                Agendado
              </span>
            </div>
          </div>
          <button className="mt-4 w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver todos os protocolos
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
              Saúde
            </h2>
            <svg
              className="h-5 w-5 text-red-500 dark:text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Consulta - Cardiologista
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  22/05/2023 - 14:30
                </p>
              </div>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Retirada de Medicamentos
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  25/05/2023
                </p>
              </div>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          <button className="mt-4 w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver agenda completa
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
              Tributos
            </h2>
            <svg
              className="h-5 w-5 text-green-500 dark:text-green-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  IPTU 2023 - Parcela 5/10
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Vencimento: 15/06/2023
                </p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded dark:bg-blue-900/30 dark:text-blue-400">
                R$ 127,45
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Taxa de Coleta - Anual
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Vencimento: 30/06/2023
                </p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded dark:bg-blue-900/30 dark:text-blue-400">
                R$ 89,20
              </span>
            </div>
          </div>
          <button className="mt-4 w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Emitir segunda via
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Obras Próximas
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                Pavimentação da Rua das Flores
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Início: 01/06/2023 • Previsão de término: 15/07/2023
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Status: Em andamento - 45% concluído
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                Reforma da Praça Central
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Início: 10/05/2023 • Previsão de término: 10/06/2023
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Status: Em andamento - 75% concluído
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                Revitalização do Parque Municipal
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Início: 15/04/2023 • Previsão de término: 20/05/2023
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Status: Concluído
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Serviços Recentes
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-2 dark:bg-blue-900/30">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                  Certidão Negativa de Débitos
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Solicitado em: 12/05/2023 • Concluído
                </p>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                  Baixar documento
                </button>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-2 dark:bg-green-900/30">
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                  Alvará de Funcionamento
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Solicitado em: 05/05/2023 • Concluído
                </p>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                  Baixar documento
                </button>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2 dark:bg-yellow-900/30">
                <svg
                  className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                  Licença Ambiental
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Solicitado em: 28/04/2023 • Em andamento
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex items-center">
                  <svg
                    className="h-4 w-4 mr-1 text-yellow-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Previsão de conclusão: 25/05/2023
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
