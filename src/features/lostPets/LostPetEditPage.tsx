"use client";

import { useParams, useNavigate } from "@tanstack/react-router";
import { AuthenticatedLayout } from "@/layouts";
import { EmptyState, LoadingState, ErrorState } from "@/components";
import { useLostPet, useUpdateLostPet, useIsOwner } from "@/hooks";
import { Especie, SexoPetPerdido } from "@/types";
import { LostPetForm, type LostPetFormValues } from "./LostPetForm";

export function LostPetEditPage() {
  const { petId } = useParams({ from: "/perdidos/editar/$petId" });
  const navigate = useNavigate();

  const { data: lostPet, isLoading, isError, error } = useLostPet(petId);
  // Os hooks ficam acima dos returns de loading/erro.
  const isOwner = useIsOwner(lostPet?.userId);
  const updateLostPetMutation = useUpdateLostPet();

  const handleSubmit = (values: LostPetFormValues, _foto: File | null) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    // O PATCH é JSON e não aceita foto — só os campos de texto.
    updateLostPetMutation.mutate(
      {
        id: petId,
        data: {
          nome: values.nome.trim(),
          localizacao: values.localizacao.trim(),
          dataUltimaVez: new Date(values.dataUltimaVez).toISOString(),
          nomeContato: values.nomeContato.trim(),
          telefoneContato: values.telefoneContato.trim(),
          emailContato: values.emailContato.trim(),
          ...(values.especie && { especie: values.especie as Especie }),
          ...(values.sexo && { sexo: values.sexo as SexoPetPerdido }),
          ...(values.raca.trim() && { raca: values.raca.trim() }),
          ...(values.cor.trim() && { cor: values.cor.trim() }),
          ...(values.descricao.trim() && { descricao: values.descricao.trim() }),
        },
      },
      {
        onSuccess: () => navigate({ to: "/perdidos" }),
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <LoadingState />
      </AuthenticatedLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <AuthenticatedLayout>
        <ErrorState message={error?.message || "Erro ao carregar animal perdido"} />
      </AuthenticatedLayout>
    );
  }

  // Quem não é o dono não pode editar: a rota exige login, mas o anúncio pode
  // pertencer a outra pessoa (acesso direto pela URL).
  if (!lostPet || !isOwner) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl">
          <EmptyState
            title="Você não pode editar este registro"
            description="Este anúncio não foi criado por você. Entre em contato com o responsável pelas informações exibidas no card."
            actionLabel="Ver todos os perdidos"
            actionTo="/perdidos"
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
      </AuthenticatedLayout>
    );
  }

  const initialValues = {
    nome: lostPet.nome,
    especie: lostPet.especie,
    sexo: lostPet.sexo ?? "",
    raca: lostPet.raca ?? "",
    cor: lostPet.cor ?? "",
    localizacao: lostPet.localizacao,
    dataUltimaVez: lostPet.dataUltimaVez.slice(0, 10),
    descricao: lostPet.descricao ?? "",
    nomeContato: lostPet.nomeContato,
    telefoneContato: lostPet.telefoneContato,
    emailContato: lostPet.emailContato,
  } as const;

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editar Animal Perdido
          </h1>
          <p className="text-gray-600">
            Atualize as informações do anúncio de {lostPet.nome}
          </p>
        </div>

        <LostPetForm
          initialValues={initialValues}
          existingFoto={lostPet.foto}
          allowPhotoChange={false}
          submitLabel={
            updateLostPetMutation.isPending
              ? "Salvando..."
              : "Salvar alterações"
          }
          isSubmitting={updateLostPetMutation.isPending}
          errorMessage={
            updateLostPetMutation.isError
              ? "Não foi possível salvar as alterações. Tente novamente."
              : null
          }
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: "/perdidos" })}
        />
      </div>
    </AuthenticatedLayout>
  );
}