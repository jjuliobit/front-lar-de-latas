"use client";

import { useNavigate } from "@tanstack/react-router";
import { AuthenticatedLayout } from "@/layouts";
import { Especie, SexoPetPerdido } from "@/types";
import { useCreateLostPet } from "@/hooks";
import { useSessionUser } from "@/hooks";
import { LostPetForm } from "./LostPetForm";

export function LostPetRegisterPage() {
  const navigate = useNavigate();
  const { data: user } = useSessionUser();
  const createLostPetMutation = useCreateLostPet();

  const handleSubmit = (values: any, foto: File | null) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!user?.id) return;

    // Só envia o que foi preenchido: o CreateLostPetDto trata o resto como
    // null e a foto vai no campo "foto" da requisição multipart.
    createLostPetMutation.mutate(
      {
        nome: values.nome.trim(),
        especie: values.especie as Especie,
        localizacao: values.localizacao.trim(),
        dataUltimaVez: new Date(values.dataUltimaVez).toISOString(),
        nomeContato: values.nomeContato.trim(),
        telefoneContato: values.telefoneContato.trim(),
        emailContato: values.emailContato.trim(),
        userId: user.id,
        foto,
        ...(values.sexo && { sexo: values.sexo as SexoPetPerdido }),
        ...(values.raca.trim() && { raca: values.raca.trim() }),
        ...(values.cor.trim() && { cor: values.cor.trim() }),
        ...(values.descricao.trim() && { descricao: values.descricao.trim() }),
      },
      {
        onSuccess: () => navigate({ to: "/perdidos" }),
      }
    );
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registrar Animal Perdido
          </h1>
          <p className="text-gray-600">
            Preencha os dados do seu animal perdido para que a comunidade possa ajudar a
            encontrá-lo
          </p>
        </div>

        {/* Alert */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 flex items-start gap-3">
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
          <div>
            <p className="font-semibold text-orange-900 mb-1">Dicas importantes</p>
            <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
              <li>Forneça o máximo de detalhes possível sobre o animal</li>
              <li>Inclua uma foto recente e de boa qualidade</li>
              <li>Mantenha seus dados de contato atualizados</li>
            </ul>
          </div>
        </div>

        <LostPetForm
          allowPhotoChange
          submitLabel={
            createLostPetMutation.isPending
              ? "Registrando..."
              : "Registrar Animal Perdido"
          }
          isSubmitting={createLostPetMutation.isPending}
          errorMessage={
            createLostPetMutation.isError
              ? "Não foi possível registrar o animal perdido. Tente novamente."
              : null
          }
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: "/perdidos" })}
        />
      </div>
    </AuthenticatedLayout>
  );
}