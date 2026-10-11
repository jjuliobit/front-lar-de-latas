import { useState } from "react";
import { Input, Select, SelectItem, Button } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/layouts";
import {
  LostPetCard,
  EmptyState,
  LoadingState,
  ErrorState,
  ConfirmDialog,
  LostPetFormModal,
} from "@/components";
import {
  useLostPets,
  useIsAuthenticated,
  useOptionalSessionUser,
  useDeleteLostPet,
  useMarkAsFound,
  useCreateLostPet,
  useToast,
} from "@/hooks";
import { getErrorMessage } from "@/services/api";
import { LostPetFilters, Especie, LostPet, SexoPetPerdido } from "@/types";
import { getSpeciesLabel } from "@/lib/utils";
import type { LostPetFormData } from "@/components/LostPetFormModal";

export function LostPetsListPage() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const { data: sessionUser } = useOptionalSessionUser();
  const deleteLostPet = useDeleteLostPet();
  const markAsFound = useMarkAsFound();
  const createLostPet = useCreateLostPet();
  const toast = useToast();

  const [filters, setFilters] = useState<LostPetFilters>({
    busca: "",
    especie: "todos",
    localizacao: "",
  });
  // Anúncio marcado para exclusão. Guardar o id em vez de apagar direto é o
  // que abre a confirmação: um clique acidental não deveria custar o anúncio.
  const [lostPetToDelete, setLostPetToDelete] = useState<LostPet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useLostPets(filters);

  const lostPets = data || [];

  const handleClearFilters = () => {
    setFilters({
      busca: "",
      especie: "todos",
      localizacao: "",
    });
  };

  const handleDeleteLostPet = async () => {
    if (!lostPetToDelete) return;

    try {
      await deleteLostPet.mutateAsync(lostPetToDelete.id);
      setLostPetToDelete(null);
    } catch {
      // Erro fica em deleteLostPet.error e é mostrado no modal.
    }
  };

  // Limpa o erro anterior ao reabrir: a mutation guarda o último erro até a
  // próxima tentativa, senão a mensagem velha continuaria no modal.
  const handleCloseDeleteDialog = () => {
    deleteLostPet.reset();
    setLostPetToDelete(null);
  };

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      toast.error("Acesso negado", "Você precisa estar autenticado para registrar um animal perdido.");
      navigate({ to: "/login" });
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateLostPet = (formData: LostPetFormData) => {
    if (!sessionUser?.id) {
      toast.error("Erro", "Você precisa estar autenticado para registrar um animal perdido.");
      navigate({ to: "/login" });
      return;
    }

    createLostPet.mutate(
      {
        nome: formData.nome.trim(),
        especie: formData.especie as Especie,
        localizacao: formData.localizacao.trim(),
        dataUltimaVez: formData.dataUltimaVez,
        nomeContato: formData.nomeContato.trim(),
        telefoneContato: formData.telefoneContato.trim(),
        emailContato: formData.emailContato.trim(),
        userId: sessionUser.id,
        foto: formData.foto,
        ...(formData.sexo && { sexo: formData.sexo as SexoPetPerdido }),
        ...(formData.raca.trim() && { raca: formData.raca.trim() }),
        ...(formData.cor.trim() && { cor: formData.cor.trim() }),
        ...(formData.descricao.trim() && { descricao: formData.descricao.trim() }),
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success("Sucesso!", "Animal perdido registrado com sucesso.");
        },
        onError: () => {
          toast.error("Erro", "Não foi possível registrar o animal perdido. Tente novamente.");
        },
      }
    );
  };

  const hasActiveFilters =
    filters.busca || filters.especie !== "todos" || filters.localizacao;

  // Loading state
  if (isLoading) {
    return (
      <PublicLayout isAuthenticated={isAuthenticated}>
        <LoadingState />
      </PublicLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <PublicLayout isAuthenticated={isAuthenticated}>
        <ErrorState message={error?.message || "Erro ao carregar pets perdidos"} />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout isAuthenticated={isAuthenticated}>
      <div className="bg-white border border-gray-200 mt-4">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Animais Perdidos
              </h1>
              <p className="text-gray-700">
                Ajude a reunir famílias com seus animais de estimação.{" "}
                {lostPets.length}{" "}
                {lostPets.length === 1 ? "animal registrado" : "animais registrados"}
              </p>
            </div>
            <Button
              size="lg"
              color="primary"
              className="font-semibold"
              onPress={handleOpenModal}
              startContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              }
            >
              Registrar animal perdido
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-5 py-8">
        {/* Alert */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4 mb-8 flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <div >
            <p className="font-semibold text-orange-900 mb-1">
              Viu algum destes animais?
            </p>
            <p className="text-sm text-orange-800">
              Entre em contato com o responsável usando as informações disponíveis na lista.
              Qualquer informação pode ajudar a reunir uma família.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Pesquisar"
              placeholder="Nome, raça..."
              value={filters.busca || ""}
              onValueChange={(value) => setFilters({ ...filters, busca: value })}
              startContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              }
              isClearable
              onClear={() => setFilters({ ...filters, busca: "" })}
            />

            <Select
              label="Espécie"
              selectedKeys={[filters.especie || "todos"]}
              onChange={(e) =>
                setFilters({ ...filters, especie: e.target.value as Especie | "todos" })
              }
            >
              <SelectItem key="todos">Todas</SelectItem>
              <SelectItem key="Cachorro">{getSpeciesLabel("Cachorro")}</SelectItem>
              <SelectItem key="Gato">{getSpeciesLabel("Gato")}</SelectItem>
              <SelectItem key="Passaro">{getSpeciesLabel("Passaro")}</SelectItem>
              <SelectItem key="Outro">{getSpeciesLabel("Outro")}</SelectItem>
            </Select>

            <Input
              label="Localização"
              placeholder="Cidade, bairro..."
              value={filters.localizacao || ""}
              onValueChange={(value) => setFilters({ ...filters, localizacao: value })}
              startContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              }
              isClearable
              onClear={() => setFilters({ ...filters, localizacao: "" })}
            />
          </div>

          {hasActiveFilters && (
            <div className="mt-4">
              <Button size="sm" variant="light" color="primary" onPress={handleClearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Lost Pets List */}
        {lostPets.length > 0 ? (
          <div className="space-y-6">
            {lostPets.map((pet) => (
              <LostPetCard
                key={pet.id}
                lostPet={pet}
                isOwner={!!sessionUser?.id && pet.userId === sessionUser.id}
                onDelete={
                  pet.userId === sessionUser?.id
                    ? () => setLostPetToDelete(pet)
                    : undefined
                }
                isDeleting={
                  deleteLostPet.isPending && deleteLostPet.variables === pet.id
                }
                onMarkAsFound={
                  pet.userId === sessionUser?.id && !pet.encontrado
                    ? () => markAsFound.mutate(pet.id)
                    : undefined
                }
                isMarkingAsFound={
                  markAsFound.isPending && markAsFound.variables === pet.id
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum animal perdido encontrado"
            description={
              hasActiveFilters
                ? "Tente ajustar os filtros para encontrar mais resultados"
                : "Não há animais perdidos registrados no momento"
            }
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            }
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={lostPetToDelete !== null}
        title={
          lostPetToDelete
            ? `Excluir ${lostPetToDelete.nome}?`
            : "Excluir animal perdido?"
        }
        isLoading={deleteLostPet.isPending}
        onConfirm={handleDeleteLostPet}
        onClose={handleCloseDeleteDialog}
        description={
          <div className="space-y-2">
            <p>
              O anúncio de{" "}
              <span className="font-semibold">{lostPetToDelete?.nome}</span>{" "}
              será removido do sistema para todos os usuários.
            </p>
            <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
            {deleteLostPet.isError && (
              <p className="text-sm text-danger">
                {getErrorMessage(deleteLostPet.error)}
              </p>
            )}
          </div>
        }
      />

      {/* Modal de Cadastro */}
      <LostPetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLostPet}
        isSubmitting={createLostPet.isPending}
      />
    </PublicLayout>
  );
}