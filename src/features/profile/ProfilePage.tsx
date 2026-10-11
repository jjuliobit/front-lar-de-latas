import { useState } from "react";
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Input,
  Tabs,
  Tab,
} from "@heroui/react";
import { AuthenticatedLayout } from "@/layouts";
import { AnimalCard, ConfirmDialog, EmptyState, LoadingState, ErrorState } from "@/components";
import { PLACEHOLDER_PET_IMAGE, resolveApiImageUrl } from "@/lib/utils";
import { useSessionUser, useUpdateProfile, useDeleteAnimal, useMyAnimals, useMyLostPets } from "@/hooks";
import { getErrorMessage } from "@/services";
import { maskCPFPartial } from "@/lib/utils";
import type { Animal } from "@/types";

export function ProfilePage() {
  const { data: profile, isLoading: loadingProfile } = useSessionUser();
  const { data: userAnimalsData } = useMyAnimals();
  const { data: lostPetsData } = useMyLostPets();
  const updateProfileMutation = useUpdateProfile();
  const deleteAnimal = useDeleteAnimal();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: profile?.nome || "",
    sobrenome: profile?.sobrenome || "",
    email: profile?.email || "",
  });
  // Animal marcado para exclusão. Guardar o id em vez de apagar direto é o que
  // abre a confirmação: a lista é a tela de "minhas coisas", onde um clique
  // acidental não deveria custar o cadastro.
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

  const userAnimals = userAnimalsData || [];
  const userLostPets = lostPetsData || [];

  const fullName = profile ? `${profile.nome} ${profile.sobrenome}`.trim() : "";

  const handleSave = async () => {
    if (!profile) return;
    try {
      await updateProfileMutation.mutateAsync({
        id: profile.id,
        data: { nome: formData.nome, sobrenome: formData.sobrenome },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: profile?.nome || "",
      sobrenome: profile?.sobrenome || "",
      email: profile?.email || "",
    });
    setIsEditing(false);
  };

  const handleDeleteAnimal = async () => {
    if (!animalToDelete) return;

    try {
      await deleteAnimal.mutateAsync(animalToDelete.id);
      setAnimalToDelete(null);
    } catch {
      // Erro fica em deleteAnimal.error e é mostrado no modal.
    }
  };

  // Limpa o erro anterior ao reabrir: a mutation guarda o último erro até a
  // próxima tentativa, senão a mensagem velha continuaria no modal.
  const handleCloseDeleteDialog = () => {
    deleteAnimal.reset();
    setAnimalToDelete(null);
  };

  // Loading state
  if (loadingProfile) {
    return (
      <AuthenticatedLayout>
        <LoadingState />
      </AuthenticatedLayout>
    );
  }

  // Erro: sessão inválida/expirada (o interceptor já redireciona para /login)
  if (!profile) {
    return (
      <AuthenticatedLayout>
        <ErrorState
          title="Não foi possível carregar seu perfil"
          message="Faça login novamente para continuar."
        />
      </AuthenticatedLayout>
    );
  }

  const userData = profile;

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e atividades</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar
                  src={userData?.foto ?? undefined}
                  name={fullName}
                  className="w-32 h-32 text-large"
                  isBordered
                  color="primary"
                />
                <Button size="sm" variant="flat" className="mt-4">
                  Alterar foto
                </Button>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isEditing ? "Editar Perfil" : fullName}
                  </h2>
                  {!isEditing && (
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={() => setIsEditing(true)}
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
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                      }
                    >
                      Editar perfil
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      label="Nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                    <Input
                      label="Sobrenome"
                      value={formData.sobrenome}
                      onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                    />
                    <Input
                      label="E-mail"
                      value={formData.email}
                      isDisabled
                      description="O e-mail não pode ser alterado"
                    />
                    <Input
                      label="CPF"
                      value={maskCPFPartial(userData.cpf || "")}
                      isDisabled
                      description="O CPF não pode ser alterado"
                    />
                    <div className="flex gap-3 pt-2">
                      <Button color="primary" onPress={handleSave}>
                        Salvar alterações
                      </Button>
                      <Button variant="flat" onPress={handleCancel}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">E-mail</p>
                      <p className="text-gray-900">{userData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CPF</p>
                      <p className="text-gray-900">{maskCPFPartial(userData.cpf || "")}</p>
                    </div>
                    {userData.telefone && (
                      <div>
                        <p className="text-sm text-gray-600">Telefone</p>
                        <p className="text-gray-900">{userData.telefone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Membro desde</p>
                      <p className="text-gray-900">
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardBody className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{userAnimals.length}</p>
              <p className="text-sm text-gray-600">Animais cadastrados</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{userLostPets.length}</p>
              <p className="text-sm text-gray-600">Perdidos</p>
            </CardBody>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardBody className="p-6">
            <Tabs
              aria-label="Profile tabs"
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary",
              }}
            >
              <Tab
                key="animals"
                title={
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                    <span>Meus Animais</span>
                  </div>
                }
              >
                <div className="pt-6">
                  {userAnimals.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {userAnimals.map((animal) => (
                        <AnimalCard
                          key={animal.id}
                          animal={animal}
                          onDelete={() => setAnimalToDelete(animal)}
                          isDeleting={
                            deleteAnimal.isPending && deleteAnimal.variables === animal.id
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Nenhum animal cadastrado"
                      description="Você ainda não cadastrou nenhum animal para adoção. Vá para a lista de animais para cadastrar."
                    />
                  )}
                </div>
              </Tab>

              <Tab
                key="lost"
                title={
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Animais Perdidos</span>
                  </div>
                }
              >
                <div className="pt-6">
                  {userLostPets.length > 0 ? (
                    <div className="space-y-3">
                      {userLostPets.map((pet) => (
                        <Card key={pet.id}>
                          <CardBody className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={pet.foto ? resolveApiImageUrl(pet.foto) ?? PLACEHOLDER_PET_IMAGE : PLACEHOLDER_PET_IMAGE}
                                alt={pet.nome}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <p className="font-semibold text-gray-900">{pet.nome}</p>
                              <p className="text-sm text-gray-600">{pet.localizacao || "Localização não informada"}</p>
                              <p className="text-xs text-gray-500">
                                {pet.encontrado ? "Encontrado" : "Perdido"}
                              </p>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">
                                  {pet.dataUltimaVez
                                    ? new Date(pet.dataUltimaVez).toLocaleDateString("pt-BR")
                                    : "—"}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Nenhum animal perdido registrado"
                      description="Você não possui registros de animais perdidos"
                    />
                  )}
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={animalToDelete !== null}
        title={animalToDelete ? `Excluir ${animalToDelete.nome}?` : "Excluir animal?"}
        isLoading={deleteAnimal.isPending}
        onConfirm={handleDeleteAnimal}
        onClose={handleCloseDeleteDialog}
        description={
          <div className="space-y-2">
            <p>
              O anúncio de{" "}
              <span className="font-semibold">{animalToDelete?.nome}</span> será
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
    </AuthenticatedLayout>
  );
}
