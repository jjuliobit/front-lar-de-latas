"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input, Select, SelectItem, Textarea, Button, Card, CardBody } from "@heroui/react";
import { AuthenticatedLayout } from "@/layouts";
import { useCreateAnimal } from "@/hooks";
import { useSessionUser } from "@/hooks";
import { Especie, Sexo } from "@/types";
import { getSpeciesLabel, getSexLabel, PLACEHOLDER_PET_IMAGE } from "@/lib/utils";

const ESPECIES: Especie[] = ["Cachorro", "Gato", "Passaro", "Outro"];
const SEXOS: Sexo[] = ["Macho", "Femea"];

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function AnimalRegisterPage() {
  const navigate = useNavigate();
  const { data: user } = useSessionUser();
  const createAnimalMutation = useCreateAnimal();

  const [formData, setFormData] = useState({
    nome: "",
    idade: "",
    sexo: "" as Sexo | "",
    especie: "" as Especie | "",
    raca: "",
    cor: "",
    descricao: "",
    localizacao: "",
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Libera o object URL anterior: sem isso cada troca de foto deixa um blob
  // preso na memória até o unload da página.
  useEffect(() => {
    if (!foto) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const clearPhoto = () => {
    setFoto(null);
    setPhotoError(null);
    // Sem zerar o value, escolher o mesmo arquivo de novo não dispara
    // onChange e a remoção parece não funcionar.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoError(null);

    if (!file) {
      setFoto(null);
      return;
    }

    // Mesmas regras do Multer no backend, para não gastar upload com erro.
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setFoto(null);
      setPhotoError("Formato não suportado. Envie JPEG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setFoto(null);
      setPhotoError("A foto deve ter no máximo 5 MB.");
      return;
    }

    setFoto(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Só envia o que foi preenchido: o CreatePetDto trata o resto como null e
    // o status fica com o @default(Disponivel) do banco.
    createAnimalMutation.mutate(
      {
        nome: formData.nome.trim(),
        idade: Number(formData.idade),
        sexo: formData.sexo as Sexo,
        especie: formData.especie as Especie,
        userId: user.id,
        foto,
        ...(formData.raca.trim() && { raca: formData.raca.trim() }),
        ...(formData.cor.trim() && { cor: formData.cor.trim() }),
        ...(formData.descricao.trim() && { descricao: formData.descricao.trim() }),
        ...(formData.localizacao.trim() && { localizacao: formData.localizacao.trim() }),
      },
      {
        onSuccess: () => navigate({ to: "/animais" }),
      }
    );
  };

  // Somente os campos obrigatórios do CreatePetDto bloqueiam o envio.
  const isFormValid =
    formData.nome.trim() !== "" &&
    formData.idade !== "" &&
    Number(formData.idade) >= 0 &&
    formData.sexo !== "" &&
    formData.especie !== "" &&
    user?.id !== undefined &&
    !createAnimalMutation.isPending;

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar Animal</h1>
          <p className="text-gray-600">
            Preencha os dados do animal para disponibilizá-lo para adoção
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Coluna esquerda - preview da foto */}
            <div>
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Foto do Animal
                  </h2>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={imagePreview || PLACEHOLDER_PET_IMAGE}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        // O object URL já foi revogado: o preview local não
                        // tem mais o que exibir.
                        setFoto(null);
                      }}
                    />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_PHOTO_TYPES.join(",")}
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="flat"
                      size="sm"
                      onPress={() => fileInputRef.current?.click()}
                    >
                      {foto ? "Trocar foto" : "Escolher foto"}
                    </Button>
                    {foto && (
                      <Button
                        variant="light"
                        color="danger"
                        size="sm"
                        onPress={clearPhoto}
                      >
                        Remover foto
                      </Button>
                    )}
                  </div>

                  {foto && (
                    <p className="mt-2 text-xs text-gray-500 truncate">
                      {foto.name} ({(foto.size / 1024).toFixed(0)} KB)
                    </p>
                  )}

                  {photoError && (
                    <p className="mt-2 text-sm text-danger">{photoError}</p>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Coluna direita - campos */}
            <div>
              <Card>
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <Input
                      label="Nome do Animal"
                      placeholder="Ex: Thor, Luna, Max..."
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      isRequired
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Idade (anos)"
                        placeholder="Ex: 3"
                        value={formData.idade}
                        onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                        min="0"
                        max="30"
                        isRequired
                      />

                      <Select
                        label="Sexo"
                        placeholder="Selecione"
                        selectedKeys={formData.sexo ? [formData.sexo] : []}
                        onChange={(e) =>
                          setFormData({ ...formData, sexo: e.target.value as Sexo })
                        }
                        isRequired
                      >
                        {SEXOS.map((sexo) => (
                          <SelectItem key={sexo}>{getSexLabel(sexo)}</SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Espécie"
                        placeholder="Selecione"
                        selectedKeys={formData.especie ? [formData.especie] : []}
                        onChange={(e) =>
                          setFormData({ ...formData, especie: e.target.value as Especie })
                        }
                        isRequired
                      >
                        {ESPECIES.map((especie) => (
                          <SelectItem key={especie}>{getSpeciesLabel(especie)}</SelectItem>
                        ))}
                      </Select>

                      <Input
                        label="Raça"
                        placeholder="Ex: Vira-lata, Labrador..."
                        value={formData.raca}
                        onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                        description="Opcional"
                      />
                    </div>

                    <Input
                      label="Cor"
                      placeholder="Ex: Preto, Branco, Marrom..."
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      description="Opcional"
                    />

                    <Input
                      label="Localização"
                      placeholder="Ex: São Paulo, SP"
                      value={formData.localizacao}
                      onChange={(e) =>
                        setFormData({ ...formData, localizacao: e.target.value })
                      }
                      description="Opcional. Onde o pet está agora."
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
                    />

                    <Textarea
                      label="Descrição"
                      placeholder="Personalidade, história, cuidados especiais,vaccinas..."
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      description="Opcional"
                      minRows={4}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {createAnimalMutation.isError && (
            <p className="mt-4 text-sm text-red-600">
              Não foi possível cadastrar o animal. Tente novamente.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              type="submit"
              size="lg"
              color="primary"
              className="flex-1 font-semibold"
              isDisabled={!isFormValid}
            >
              {createAnimalMutation.isPending ? "Cadastrando..." : "Cadastrar Animal"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="bordered"
              onPress={() => navigate({ to: "/animais" })}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}