import { Link } from "@tanstack/react-router";
import { Card, CardBody, Button } from "@heroui/react";
import { AuthenticatedLayout } from "@/layouts";
import { LoadingState } from "@/components";
import { useDashboardStats, useAnimals, useReceivedAdoptions, useSentAdoptions } from "@/hooks";
import { useSessionUser } from "@/hooks";

export function DashboardPage() {
  const { data: sessionUser } = useSessionUser();
  const fullName = sessionUser
    ? [sessionUser.nome, sessionUser.sobrenome].filter(Boolean).join(" ").trim()
    : "";
  
  // Usar hooks da API real
  const { data: statsData, isLoading: loadingStats } = useDashboardStats();
  const { data: animalsData } = useAnimals();
  const { data: receivedAdoptions } = useReceivedAdoptions();
  const { data: sentAdoptions } = useSentAdoptions();

  const stats = statsData || {
    totalAnimais: 0,
    adocoesEmAndamento: 0,
    adocoesConcluidas: 0,
    animaisPerdidosRegistrados: 0,
  };

  const animals = animalsData?.data ?? [];
  const availableAnimals = animals.filter((a) => a.status === "Disponivel").length;

  // Contar solicitações recebidas (pessoas querendo seus pets)
  const solicitacoesRecebidas = receivedAdoptions?.filter(
    (a) => ["Enviado", "Analisando"].includes(a.status)
  ).length ?? 0;

  // Contar suas solicitações enviadas (pets que você quer adotar)
  const minhasSolicitacoes = sentAdoptions?.filter(
    (a) => ["Enviado", "Analisando"].includes(a.status)
  ).length ?? 0;

  // Loading state
  if (loadingStats) {
    return (
      <AuthenticatedLayout>
        <LoadingState />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo de volta, {fullName || 'Usuário'}! Aqui está um resumo das suas atividades.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
          <Card className="bg-gradient-to-br from-primary to-primary-dark text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Animais Cadastrados</p>
                  <p className="text-3xl font-bold">{stats.totalAnimais}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-white/80 mt-2">
                {availableAnimals} disponíveis para adoção
              </p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Solicitações Recebidas</p>
                  <p className="text-3xl font-bold">{solicitacoesRecebidas}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8"
                  >
                    <path d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-white/80 mt-2">Pessoas querendo seus pets</p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Minhas Solicitações</p>
                  <p className="text-3xl font-bold">{minhasSolicitacoes}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8"
                  >
                    <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-white/80 mt-2">Pets que você quer adotar</p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Adoções Concluídas</p>
                  <p className="text-3xl font-bold">{stats.adocoesConcluidas}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-white/80 mt-2">Animais adotados com sucesso</p>
            </CardBody>
          </Card>
        </div>

      </div>
    </AuthenticatedLayout>
  );
}
