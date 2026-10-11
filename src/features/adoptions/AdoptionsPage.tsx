import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { AuthenticatedLayout } from "@/layouts";
import { AdoptionCard, EmptyState, LoadingState, ErrorState } from "@/components";
import {
  useReceivedAdoptions,
  useSentAdoptions,
  useCompleteAdoption,
  useRejectAdoption,
  useToast,
} from "@/hooks";

export function AdoptionsPage() {
  const [activeTab, setActiveTab] = useState<string>("received");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const toast = useToast();

  // Queries com refetch automático a cada 10 segundos
  const {
    data: receivedAdoptions,
    isLoading: isLoadingReceived,
    isError: isErrorReceived,
    error: errorReceived,
  } = useReceivedAdoptions();

  const {
    data: sentAdoptions,
    isLoading: isLoadingSent,
    isError: isErrorSent,
    error: errorSent,
  } = useSentAdoptions();

  // Mutations
  const completeAdoption = useCompleteAdoption();
  const rejectAdoption = useRejectAdoption();

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await completeAdoption.mutateAsync(id);
      toast.success(
        "Adoção aprovada com sucesso!",
        "O animal foi transferido para o novo dono."
      );
    } catch (error) {
      toast.error(
        "Erro ao aprovar adoção",
        "Tente novamente mais tarde."
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    try {
      await rejectAdoption.mutateAsync(id);
      toast.success(
        "Solicitação rejeitada",
        "A solicitação foi recusada com sucesso."
      );
    } catch (error) {
      toast.error(
        "Erro ao rejeitar solicitação",
        "Tente novamente mais tarde."
      );
    } finally {
      setRejectingId(null);
    }
  };

  const isLoading = activeTab === "received" ? isLoadingReceived : isLoadingSent;
  const isError = activeTab === "received" ? isErrorReceived : isErrorSent;
  const error = activeTab === "received" ? errorReceived : errorSent;

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Adoções</h1>
          <p className="text-gray-600">
            Acompanhe o status de todas as suas solicitações de adoção
          </p>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          aria-label="Abas de adoções"
          className="mb-6"
          color="primary"
          variant="underlined"
        >
          <Tab
            key="received"
            title={
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"
                  />
                </svg>
                <span>Solicitações Recebidas</span>
                {receivedAdoptions && receivedAdoptions.length > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {receivedAdoptions.filter((a) =>
                      ["Enviado", "Analisando"].includes(a.status)
                    ).length}
                  </span>
                )}
              </div>
            }
          >
            {isLoadingReceived ? (
              <LoadingState />
            ) : isErrorReceived ? (
              <ErrorState message={errorReceived?.message || "Erro ao carregar adoções"} />
            ) : receivedAdoptions && receivedAdoptions.length > 0 ? (
              <div className="space-y-4">
                {receivedAdoptions.map((adoption) => (
                  <AdoptionCard
                    key={adoption.id}
                    adoption={adoption}
                    type="received"
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isApproving={approvingId === adoption.id}
                    isRejecting={rejectingId === adoption.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhuma solicitação recebida"
                description="Quando alguém solicitar a adoção de um dos seus animais, a solicitação aparecerá aqui."
                actionLabel="Ver meus animais"
                actionTo="/dashboard"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"
                    />
                  </svg>
                }
              />
            )}
          </Tab>

          <Tab
            key="sent"
            title={
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                <span>Minhas Solicitações</span>
              </div>
            }
          >
            {isLoadingSent ? (
              <LoadingState />
            ) : isErrorSent ? (
              <ErrorState message={errorSent?.message || "Erro ao carregar adoções"} />
            ) : sentAdoptions && sentAdoptions.length > 0 ? (
              <div className="space-y-4">
                {sentAdoptions.map((adoption) => (
                  <AdoptionCard
                    key={adoption.id}
                    adoption={adoption}
                    type="sent"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Você ainda não solicitou nenhuma adoção"
                description="Quando você encontrar um animal que queira adotar, clique em 'Eu quero adotar' na página do animal."
                actionLabel="Ver animais disponíveis"
                actionTo="/animais"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                }
              />
            )}
          </Tab>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}

