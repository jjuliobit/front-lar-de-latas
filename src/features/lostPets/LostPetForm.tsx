"use client";

import { useEffect, useRef, useState } from "react";
import { Input, Select, SelectItem, Textarea, Button, Card, CardBody } from "@heroui/react";
import { Especie, SexoPetPerdido } from "@/types";
import {
  getSpeciesLabel,
  getSexLabel,
  PLACEHOLDER_PET_IMAGE,
  resolveApiImageUrl,
} from "@/lib/utils";

const ESPECIES: Especie[] = ["Cachorro", "Gato", "Passaro", "Outro"];
const SEXOS: SexoPetPerdido[] = ["Macho", "Femea"];

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export interface LostPetFormValues {
  nome: string;
  especie: Especie | "";
  sexo: SexoPetPerdido | "";
  raca: string;
  cor: string;
  localizacao: string;
  /** Valor do input type=date, em yyyy-MM-dd. */
  dataUltimaVez: string;
  descricao: string;
  nomeContato: string;
  telefoneContato: string;
  emailContato: string;
}

interface LostPetFormProps {
  /** Valores iniciais para a tela de edição; no cadastro o form começa vazio. */
  initialValues?: Partial<LostPetFormValues>;
  /** Foto já salva no registro (edição): mostra só o preview, sem troca. */
  existingFoto?: string | null;
  /** No cadastro permite escolher/remover um arquivo novo (POST é multipart). */
  allowPhotoChange?: boolean;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (values: LostPetFormValues, foto: File | null) => void;
  onCancel: () => void;
}

const EMPTY_VALUES: LostPetFormValues = {
  nome: "",
  especie: "",
  sexo: "",
  raca: "",
  cor: "",
  localizacao: "",
  dataUltimaVez: "",
  descricao: "",
  nomeContato: "",
  telefoneContato: "",
  emailContato: "",
};

export function LostPetForm({
  initialValues,
  existingFoto,
  allowPhotoChange = true,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: LostPetFormProps) {
  const [values, setValues] = useState<LostPetFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
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
    onSubmit(values, foto);
  };

  // Somente os campos obrigatórios do CreateLostPetDto bloqueiam o envio.
  const isFormValid =
    values.nome.trim() !== "" &&
    values.especie !== "" &&
    values.localizacao.trim() !== "" &&
    values.dataUltimaVez !== "" &&
    values.nomeContato.trim() !== "" &&
    values.telefoneContato.trim() !== "" &&
    values.emailContato.trim() !== "" &&
    !isSubmitting;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Photo */}
        <Card>
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Foto do Animal
            </h2>

            {allowPhotoChange ? (
              <div className="space-y-4">
                <div className="w-full max-w-xs aspect-square rounded-lg overflow-hidden bg-gray-100">
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

                <div className="flex gap-2">
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
                  <p className="text-xs text-gray-500 truncate">
                    {foto.name} ({(foto.size / 1024).toFixed(0)} KB)
                  </p>
                )}

                {photoError && (
                  <p className="text-sm text-danger">{photoError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full max-w-xs aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={
                      existingFoto
                        ? resolveApiImageUrl(existingFoto) ?? PLACEHOLDER_PET_IMAGE
                        : PLACEHOLDER_PET_IMAGE
                    }
                    alt="Foto atual"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  A foto não pode ser alterada por aqui. Para trocar, exclua e
                  cadastre novamente.
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Animal Information */}
        <Card>
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações do Animal
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nome do Animal"
                  placeholder="Ex: Thor, Luna, Max..."
                  value={values.nome}
                  onChange={(e) => setValues({ ...values, nome: e.target.value })}
                  isRequired
                />

                <Select
                  label="Espécie"
                  placeholder="Selecione"
                  selectedKeys={values.especie ? [values.especie] : []}
                  onChange={(e) =>
                    setValues({ ...values, especie: e.target.value as Especie })
                  }
                  isRequired
                >
                  {ESPECIES.map((especie) => (
                    <SelectItem key={especie}>{getSpeciesLabel(especie)}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Sexo (opcional)"
                  placeholder="Selecione"
                  selectedKeys={values.sexo ? [values.sexo] : []}
                  onChange={(e) =>
                    setValues({ ...values, sexo: e.target.value as SexoPetPerdido })
                  }
                >
                  {SEXOS.map((sexo) => (
                    <SelectItem key={sexo}>{getSexLabel(sexo)}</SelectItem>
                  ))}
                </Select>

                <Input
                  label="Raça (opcional)"
                  placeholder="Ex: Vira-lata, Labrador..."
                  value={values.raca}
                  onChange={(e) => setValues({ ...values, raca: e.target.value })}
                />
              </div>

              <Input
                label="Cor (opcional)"
                placeholder="Ex: Preto, Branco, Marrom..."
                value={values.cor}
                onChange={(e) => setValues({ ...values, cor: e.target.value })}
              />

              <Textarea
                label="Descrição (opcional)"
                placeholder="Características, comportamento ou algo que ajude a reconhecer o animal"
                value={values.descricao}
                onChange={(e) =>
                  setValues({ ...values, descricao: e.target.value })
                }
                minRows={4}
              />
            </div>
          </CardBody>
        </Card>

        {/* Location and Date */}
        <Card>
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Local e Data
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Visto pela última vez em"
                placeholder="Ex: Praça da Vila Mariana, São Paulo - SP"
                value={values.localizacao}
                onChange={(e) =>
                  setValues({ ...values, localizacao: e.target.value })
                }
                isRequired
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

              <Input
                type="date"
                label="Data em que foi visto"
                value={values.dataUltimaVez}
                onChange={(e) =>
                  setValues({ ...values, dataUltimaVez: e.target.value })
                }
                isRequired
              />
            </div>
          </CardBody>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardBody className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações de Contato
            </h2>
            <div className="space-y-4">
              <Input
                label="Nome do responsável"
                placeholder="Seu nome completo"
                value={values.nomeContato}
                onChange={(e) =>
                  setValues({ ...values, nomeContato: e.target.value })
                }
                isRequired
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={values.telefoneContato}
                  onChange={(e) =>
                    setValues({ ...values, telefoneContato: e.target.value })
                  }
                  isRequired
                />

                <Input
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={values.emailContato}
                  onChange={(e) =>
                    setValues({ ...values, emailContato: e.target.value })
                  }
                  isRequired
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {errorMessage && (
        <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button
          type="submit"
          size="lg"
          color="primary"
          className="flex-1 font-semibold"
          isDisabled={!isFormValid}
        >
          {submitLabel}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="bordered"
          onPress={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}