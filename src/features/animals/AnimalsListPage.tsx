import { useState } from "react";
import { Input, Select, SelectItem, Button } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/layouts";
import { AnimalCard, EmptyState, LoadingState, ErrorState, AnimalFormModal } from "@/components";
import { useFilteredAnimals, useIsAuthenticated, useCreateAdoption, useOptionalSessionUser, useToast, useCreateAnimal } from "@/hooks";
import { AnimalFilters, Especie, Sexo, StatusPet } from "@/types";
import { getSpeciesLabel, getSexLabel } from "@/lib/utils";
import type { AnimalFormData } from "@/components/AnimalFormModal";

const PAGE_SIZE = 12;

export function AnimalsListPage() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const { data: currentUser } = useOptionalSessionUser();
  const createAdoption = useCreateAdoption();
  const createAnimalMutation = useCreateAnimal();
  const toast = useToast();
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState<AnimalFilters>({
    busca: "",
    especie: "todos",
    sexo: "todos",
    status: "todos",
  });
  const [page, setPage] = useState(1);

  // GET /api/pet?page=&limit= devolve { data, meta }.
  const { data, isLoading, isError, error } = useFilteredAnimals(filters, {
    page,
    limit: PAGE_SIZE,
  });

  const pets = data?.data ?? [];
  const meta = data?.meta;

  const handleAdopt = async (petId: string) => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    setAdoptingId(petId);
    try {
      await createAdoption.mutateAsync({ petId });

      // Mostrar toast de sucesso
      toast.success(
        "Solicitação enviada com sucesso!",
        "Aguarde a aprovação do dono do animal. Você pode acompanhar em 'Minhas Adoções'."
      );

      // Redireciona para a página de adoções após 1.5s
      setTimeout(() => {
        navigate({ to: "/adocoes" });
      }, 1500);
    } catch (error) {
      console.error("Erro ao solicitar adoção:", error);
      toast.error(
        "Erro ao solicitar adoção",
        "Tente novamente mais tarde."
      );
    } finally {
      setAdoptingId(null);
    }
  };

  const handleCreateAnimal = (formData: AnimalFormData) => {
    if (!currentUser?.id) {
      toast.error("Erro", "Você precisa estar autenticado para cadastrar um animal.");
      navigate({ to: "/login" });
      return;
    }

    createAnimalMutation.mutate(
      {
        nome: formData.nome.trim(),
        idade: Number(formData.idade),
        sexo: formData.sexo as Sexo,
        especie: formData.especie as Especie,
        userId: currentUser.id,
        foto: formData.foto,
        ...(formData.raca.trim() && { raca: formData.raca.trim() }),
        ...(formData.cor.trim() && { cor: formData.cor.trim() }),
        ...(formData.descricao.trim() && { descricao: formData.descricao.trim() }),
        ...(formData.localizacao.trim() && { localizacao: formData.localizacao.trim() }),
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success("Sucesso!", "Animal cadastrado com sucesso.");
        },
        onError: () => {
          toast.error("Erro", "Não foi possível cadastrar o animal. Tente novamente.");
        },
      }
    );
  };

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      toast.error("Acesso negado", "Você precisa estar autenticado para cadastrar um animal.");
      navigate({ to: "/login" });
      return;
    }
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({
      busca: "",
      especie: "todos",
      sexo: "todos",
      status: "todos",
    });
    setPage(1);
  };

  // Trocar de página ou de filtro invalida o resultado anterior.
  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (next: AnimalFilters) => {
    setFilters(next);
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(filters.busca) ||
    filters.especie !== "todos" ||
    filters.sexo !== "todos" ||
    filters.status !== "todos";

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
        <ErrorState message={error?.message || "Erro ao carregar animais"} />
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
                Animais para Adoção
              </h1>
              <p className="text-gray-700">
                {hasActiveFilters
                  ? `${pets.length} ${pets.length === 1 ? "resultado" : "resultados"} nesta página`
                  : `Encontre seu novo melhor amigo. ${meta?.totalItems ?? 0} ${(meta?.totalItems ?? 0) === 1 ? "animal disponível" : "animais disponíveis"
                  }`}
              </p>
            </div>
            <Button
              size="lg"
              color="primary"
              className="font-semibold shrink-0"
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
              Cadastrar animal
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Pesquisar"
              placeholder="Nome, raça ou localização..."
              value={filters.busca}
              onValueChange={(value) => handleFilterChange({ ...filters, busca: value })}
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
              onClear={() => handleFilterChange({ ...filters, busca: "" })}
            />

            <Select
              label="Espécie"
              selectedKeys={[filters.especie || "todos"]}
              onChange={(e) =>
                handleFilterChange({ ...filters, especie: e.target.value as Especie | "todos" })
              }
            >
              <SelectItem key="todos" >
                Todas
              </SelectItem>
              <SelectItem key="Cachorro" >
                {getSpeciesLabel("Cachorro")}
              </SelectItem>
              <SelectItem key="Gato" >
                {getSpeciesLabel("Gato")}
              </SelectItem>
              <SelectItem key="Passaro" >
                {getSpeciesLabel("Passaro")}
              </SelectItem>
              <SelectItem key="Outro" >
                {getSpeciesLabel("Outro")}
              </SelectItem>
            </Select>

            <Select
              label="Sexo"
              selectedKeys={[filters.sexo || "todos"]}
              onChange={(e) =>
                handleFilterChange({ ...filters, sexo: e.target.value as Sexo | "todos" })
              }
            >
              <SelectItem key="todos" >
                Todos
              </SelectItem>
              <SelectItem key="Macho" >
                {getSexLabel("Macho")}
              </SelectItem>
              <SelectItem key="Femea" >
                {getSexLabel("Femea")}
              </SelectItem>
            </Select>

            <Select
              label="Status"
              selectedKeys={[filters.status || "todos"]}
              onChange={(e) =>
                handleFilterChange({ ...filters, status: e.target.value as StatusPet | "todos" })
              }
            >
              <SelectItem key="todos" >
                Todos
              </SelectItem>
              <SelectItem key="Disponivel" >
                Disponível
              </SelectItem>
              <SelectItem key="EmProcesso" >
                Em processo
              </SelectItem>
              <SelectItem key="Adotado" >
                Adotado
              </SelectItem>
              <SelectItem key="Indisponivel" >
                Indisponível
              </SelectItem>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="mt-4">
              <Button size="sm" variant="light" color="primary" onPress={handleClearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Animals Grid */}
        {pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {pets.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                onAdopt={() => handleAdopt(animal.id)}
                isAdopting={adoptingId === animal.id}
                isOwner={currentUser?.id === animal.userId}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum animal encontrado"
            description={
              hasActiveFilters
                ? "Tente ajustar os filtros para encontrar mais animais"
                : "Não há animais disponíveis no momento"
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

        {/* Paginação */}
        {meta && meta.totalPages > 1 && (
          <nav
            aria-label="Paginação de animais"
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Button
              size="sm"
              variant="bordered"
              isDisabled={!meta.hasPreviousPage || isLoading}
              onPress={() => handlePageChange(meta.page - 1)}
            >
              Anterior
            </Button>

            <span className="text-sm text-gray-600">
              Página {meta.page} de {meta.totalPages}
            </span>

            <Button
              size="sm"
              variant="bordered"
              isDisabled={!meta.hasNextPage || isLoading}
              onPress={() => handlePageChange(meta.page + 1)}
            >
              Próxima
            </Button>
          </nav>
        )}
      </div>

      {/* Modal de Cadastro */}
      <AnimalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAnimal}
        isSubmitting={createAnimalMutation.isPending}
      />
    </PublicLayout>
  );
}
