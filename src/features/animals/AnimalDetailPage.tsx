import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { Button, Chip, Card, CardBody, Divider, useDisclosure } from "@heroui/react";
import { PublicLayout } from "@/layouts";
import { ConfirmDialog, EmptyState, LoadingState, ErrorState } from "@/components";
import {
  useAnimal,
  useCreateAdoption,
  useDeleteAnimal,
  useIsAuthenticated,
  useIsOwner,
} from "@/hooks";
import { getErrorMessage } from "@/services/api";
import {
  getSpeciesLabel,
  getSexLabel,
  getStatusLabel,
  getStatusColor,
  formatDate,
  PLACEHOLDER_PET_IMAGE,
  resolveApiImageUrl,
} from "@/lib/utils";

export function AnimalDetailPage() {
  const { id } = useParams({ from: "/animais/$id" });
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  // Usar hook da API real
  const { data: animal, isLoading, isError, error } = useAnimal(id);

  // Quem cadastrou o animal gerencia o registro; quem só navega não tem
  // botão de escrita. Os hooks ficam acima dos returns de loading/erro.
  const isOwner = useIsOwner(animal?.userId);
  const deleteAnimal = useDeleteAnimal();
  const createAdoption = useCreateAdoption();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Solicitar adoção exige sessão: quem não estiver logado vai para o login.
  // Em caso de sucesso a solicitação fica em "Enviado" e o usuário acompanha
  // depois; a tela de listagem ainda é um placeholder.
  const handleAdopt = async () => {
    if (!animal) return;

    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    try {
      await createAdoption.mutateAsync({ petId: animal.id });
      navigate({ to: "/adocoes" });
    } catch {
      // Erro permanece em createAdoption.error e é mostrado no próprio botão.
    }
  };

  const handleDelete = async () => {
    if (!animal) return;

    try {
      await deleteAnimal.mutateAsync(animal.id);
      onClose();
      // Sai da página do pet removido: sem isso ela cairia no estado
      // "não encontrado" logo após a invalidação do cache.
      navigate({ to: "/animais" });
    } catch {
      // Erro permanece em deleteAnimal.error e é mostrado no modal.
    }
  };

  // Descartar o erro anterior ao reabrir: a mutation guarda o último erro até
  // a próxima tentativa, senão a mensagem velha continuaria no modal.
  const handleCloseDialog = () => {
    deleteAnimal.reset();
    onClose();
  };

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
        <div className="container mx-auto px-4 py-12">
          <ErrorState message={error?.message || "Erro ao carregar animal"} />
        </div>
      </PublicLayout>
    );
  }

  if (!animal) {
    return (
      <PublicLayout isAuthenticated={isAuthenticated}>
        <div className="container mx-auto px-4 py-12">
          <EmptyState
            title="Animal não encontrado"
            description="O animal que você está procurando não foi encontrado ou foi removido."
            actionLabel="Ver todos os animais"
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
                  d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                />
              </svg>
            }
          />
        </div>
      </PublicLayout>
    );
  }

  const isAdopted = animal.status === "Adotado";
  const isInProcess = animal.status === "EmProcesso";

  return (
    <PublicLayout isAuthenticated={isAuthenticated}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Button
            as={Link}
            to="/animais"
            variant="light"
            startContent={
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
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            }
          >
            Voltar para animais
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg sticky top-8">
              <img
                src={resolveApiImageUrl(animal.foto) || PLACEHOLDER_PET_IMAGE}
                alt={animal.nome}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {animal.nome}
                </h1>
                <Chip color={getStatusColor(animal.status)} variant="flat">
                  {getStatusLabel(animal.status)}
                </Chip>
              </div>
              <p className="text-xl text-gray-600">
                {getSpeciesLabel(animal.especie)} • {animal.raca || "Raça não informada"}
              </p>
            </div>

            <Divider />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardBody className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Idade</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {animal.idade} {animal.idade === 1 ? "ano" : "anos"}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Sexo</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getSexLabel(animal.sexo)}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Cor</p>
                  <p className="text-lg font-semibold text-gray-900">{animal.cor}</p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Localização</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
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
                    <span className="truncate">{animal.localizacao}</span>
                  </p>
                </CardBody>
              </Card>
            </div>

            <Divider />

            {/* About Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sobre {animal.nome}
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {animal.descricao}
              </p>
            </div>

            <Divider />

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Cadastrado em: <span className="font-medium">{formatDate(animal.createdAt)}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isAdopted && !isOwner && (
                <Button
                  size="lg"
                  color="primary"
                  className="flex-1 font-semibold"
                  isDisabled={isInProcess}
                  isLoading={createAdoption.isPending}
                  onPress={handleAdopt}
                  startContent={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  }
                >
                  {isInProcess ? "Em processo de adoção" : "Eu quero adotar"}
                </Button>
              )}
              {isAdopted && (
                <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-gray-700 font-semibold">
                    Este animal já foi adotado
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Mas existem muitos outros esperando por um lar!
                  </p>
                </div>
              )}
              <Button
                size="lg"
                variant="bordered"
                color="primary"
                as={Link}
                to="/animais"
              >
                Ver outros animais
              </Button>
            </div>

            {/* Área do dono: só aparece para quem cadastrou o animal */}
            {isOwner && (
              <Card>
                <CardBody className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Você cadastrou este animal
                    </p>
                    <p className="text-sm text-gray-600">
                      A exclusão remove o anúncio para todos os visitantes e
                      não pode ser desfeita.
                    </p>
                  </div>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={onOpen}
                    startContent={
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    }
                  >
                    Excluir animal
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isOpen}
        title={`Excluir ${animal.nome}?`}
        confirmLabel="Excluir"
        isLoading={deleteAnimal.isPending}
        onConfirm={handleDelete}
        onClose={handleCloseDialog}
        description={
          <div className="space-y-2">
            <p>
              O anúncio de{" "}
              <span className="font-semibold">{animal.nome}</span> será
              removido do sistema para todos os usuários.
            </p>
            <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
            {deleteAnimal.isError && (
              <p className="text-sm text-danger">
                {getErrorMessage(deleteAnimal.error)}
              </p>
            )}
          </div>
        }
      />
    </PublicLayout>
  );
}
